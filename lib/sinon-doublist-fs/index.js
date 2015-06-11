/**
 * node.js `fs` mixins for sinon-doublist
 *
 * Licensed under MIT.
 * Copyright (c) 2013 David Smith <https://github.com/codeactual/>
 */

'use strict';

/**
 * Reference to `sinonDoublistFs()`.
 */
module.exports = sinonDoublistFs;

const fs = require('fs');
const path = require('path');

const configurable = require('configurable');
const is = require('is');

const wrapFs = {}; // Wrapped fs.* methods
const realFs = {}; // Real counterparts to all wrapFs methods
let fileStubMap; // FileStub instances indexed by absolute path
let log; // long-con console logger function
const mixin = {}; // Methods mixed into the test context, ex. stubFile()
let nodeConsole; // NodeConsole instance for creating loggers
let context; // Test context provided to `sinonDoublistFs()`

const rtrimSlashRe = /\/+$/;

/**
 * Init `fs` stubs.
 *
 * @param {object|string} test Test context *OR* name of supported test runner
 * - `{object}` Context object including `sandbox` from prior `sinonDoublist()` call
 * - `{string}` Named runner will be configured to automatically set-up/tear-down.
 * - Supported runners: 'mocha'
 */
function sinonDoublistFs(test) {
  if (module.exports.trace) {
    nodeConsole = require('long-con').create();
    log = nodeConsole
      .set('nlFirst', true)
      .set('time', false)
      .set('traceDepth', true)
      .create(null, console.log); // eslint-disable-line no-console
    nodeConsole.traceMethods('FileStub', FileStub, log, null, /^prototype$/);
    nodeConsole.traceMethods('FileStub', FileStub.prototype, log, null, /^(get|set)$/);
    nodeConsole.traceMethods('wrapFs', wrapFs, log);
    nodeConsole.traceMethods('mixin', mixin, log);
  } else {
    log = function noOpLogger() {};
  }

  if (is.string(test)) { globalInjector[test](); return; } // Ex. 'mocha'
  if (is.fn(realFs.exists)) { return; } // Already doubled

  // Mix in stubFile(), stubTree(), etc.
  Object.keys(mixin).forEach(function forEachMixinMethod(method) { test[method] = mixin[method].bind(test); });

  // Replace a selection of `fs`
  Object.keys(wrapFs).forEach(function forEachWrapFsMethod(method) {
    realFs[method] = fs[method];
    fs[method] = wrapFs[method];
  });

  fileStubMap = {};
  context = test;
}

/**
 * Fallback on real `fs` methods if target file's stub does not exist.
 *
 * Default: `1`
 *
 * Options:
 *
 * - `0` Do nothing
 * - `1` Fallback on real `fs`
 * - `2` Throw error
 *
 * @type {boolean}
 * @api private
 */
sinonDoublistFs.realFsFallback = 1;

/**
 * Use long-con's object-specific stack tracing for debugging.
 *
 * @type {boolean}
 * @api private
 */
sinonDoublistFs.trace = false;

/**
 * Retrieve an existing stub.
 *
 * @param {string} name Absolute path of file/directory w/out trailing slash
 * - Trailing slashes will be dropped.
 * @return {object} FileStub instance, or undefined if not found.
 */
mixin.getFileStub = function mixinGetFileStub(name) {
  return fileStubMap[rtrimSlash(name)];
};

/**
 * Begin configuring a file stub.
 *
 * Usage:
 *
 *     const stub = this.stubFile('/path/to/file');
 *     stub
 *       .stat('size', 50)
 *       .stat('gid', 2000)
 *       .make();
 *
 * If the test needs ancestor directories to be automatically created/stubbed,
 * use mixin.stubTree instead.
 *
 * @param {string} name Absolute path of file/directory w/out trailing slash
 * @return {object} this
 */
mixin.stubFile = function mixinStubFile(name) {
  name = rtrimSlash(name);
  log('name: %s', name);
  if (!is.string(name) || name.trim() === '') {
    throw new Error('invalid stubFile() name: ' + JSON.stringify(name));
  }

  const fileStub = new FileStub();
  return fileStub.set('name', name);
};

/**
 * Stub a file tree based on a sparse list of absolute paths.
 *
 * Any missing ancestor directories will be created automatically.
 *
 * Usage:
 *
 *     this.stubTree('/root/a/b2');
 *     this.stubTree([
 *       '/root/a/b2',
 *       '/root/a2',
 *       '/root/a3/b4/c'
 *     ]);
 *
 * @param {string|array} paths File/directory absolute paths
 * - Use a trailing slash to indicate an empty directory.
 */
mixin.stubTree = function mixinStubTree(paths) {
  const self = this;
  const sparse = paths;
  const dense = intermediatePaths(paths);
  let densePaths = Object.keys(dense);

  // Process descendants before their parent in order to detect if the former
  // are also directories.
  densePaths = densePaths.sort(function sortDensePaths(a, b) {
    return a.length === b.length ? 0 : (a.length < b.length ? 1 : -1);
  });

  densePaths.forEach(function forEachDensePath(name) {
    let readdir = dense[name];
    if (fileStubMap[name]) { return; }

    if (!readdir.length) {
      // Interpret trailing slash as empty dir
      if (sparse.indexOf(name + '/') === -1) {
        readdir = false;
      } else {
        readdir = [];
      }
    }

    self.stubFile(name)
      .readdir(readdir)
      .set('parentName', path.dirname(name))
      .make();
  });
};

/**
 * Clean up resources not covered by `sinonDoublist` sandbox restoration.
 */
mixin.restoreFs = function mixinRestoreFs() {
  Object.keys(wrapFs).forEach(function forEachWrapFsMethod(method) {
    fs[method] = realFs[method];
    delete realFs[method];
  });
  fileStubMap = null;
};

/**
 * Rely on the file stub map for existence checks.
 *
 * @param {string} filename
 * @param {function} cb
 * @api private
 */
wrapFs.exists = function wrapFsExists(filename, cb) {
  filename = rtrimSlash(filename);
  if (fileStubMap[filename]) {
    setImmediate(function callbackWithTrue() {
      cb(true);
    });
  } else if (sinonDoublistFs.realFsFallback) {
    fsFallback('exists', arguments);
  }
};

/**
 * Rely on the file stub map for existence checks.
 *
 * @param {string} filename
 * @return {boolean}
 * @api private
 */
wrapFs.existsSync = function wrapFsExistsSync(filename) {
  filename = rtrimSlash(filename);
  if (fileStubMap[filename]) {
    return true;
  } else if (sinonDoublistFs.realFsFallback) {
    return fsFallback('existsSync', arguments);
  }
};

/**
 * Rely on the file stub map for stat objects.
 *
 * @param {string} filename
 * @param {function} cb
 * @api private
 */
wrapFs.lstat = function wrapFsLstat(filename, cb) {
  filename = rtrimSlash(filename);
  const stub = fileStubMap[filename];
  if (stub) {
    setImmediate(function callbackWithStats() {
      cb(null, hydrateStatsObj(stub));
    });
  } else if (sinonDoublistFs.realFsFallback) {
    fsFallback('lstat', arguments);
  }
};

/**
 * Rely on the file stub map for stat objects.
 *
 * @param {string} filename
 * @return {boolean}
 * @api private
 */
wrapFs.lstatSync = function wrapFsLstatSync(filename) {
  filename = rtrimSlash(filename);
  const stub = fileStubMap[filename];
  if (stub) {
    return hydrateStatsObj(stub);
  } else if (sinonDoublistFs.realFsFallback) {
    return fsFallback('lstatSync', arguments);
  }
};

/**
 * Rely on the file stub map for buffer retrieval.
 *
 * @param {string} filename
 * @param {mixed} args*
 * @api private
 */
wrapFs.readFile = function wrapFsReadFile(filename) {
  const cb = arguments.length === 3 ? arguments[2] : arguments[1];
  const stub = fileStubMap[filename];
  if (stub) {
    setImmediate(function callbackWithBuffer() {
      cb(null, stub.get('buffer'));
    });
  } else if (sinonDoublistFs.realFsFallback) {
    fsFallback('readFile', arguments);
  }
};

/**
 * Rely on the file stub map for buffer retrieval.
 *
 * @param {string} filename
 * @param {object} [options]
 * @return {boolean}
 * @api private
 */
wrapFs.readFileSync = function wrapFsReadFileSync(filename) {
  const stub = fileStubMap[filename];
  if (stub) {
    return stub.get('buffer');
  } else if (sinonDoublistFs.realFsFallback) {
    return fsFallback('readFileSync', arguments);
  }
};

/**
 * Rely on the file stub map for readdir list.
 *
 * @param {string} filename
 * @param {function} cb
 * @api private
 */
wrapFs.readdir = function wrapFsReaddir(filename, cb) {
  filename = rtrimSlash(filename);
  const stub = fileStubMap[filename];
  if (stub) {
    const files = stub.get('readdir');
    let err = null;
    if (!files) { err = new Error('ENOTDIR, not a directory ' + filename); }
    setImmediate(function callbackWithFiles() {
      cb(err, files);
    });
  } else if (sinonDoublistFs.realFsFallback) {
    fsFallback('readdir', arguments);
  }
};

/**
 * Rely on the file stub map for readdir list.
 *
 * @param {string} filename
 * @return {boolean}
 * @api private
 */
wrapFs.readdirSync = function wrapFsReaddirSync(filename) {
  filename = rtrimSlash(filename);
  const stub = fileStubMap[filename];
  if (stub) {
    const files = stub.get('readdir');
    if (!files) { throw new Error('ENOTDIR, not a directory ' + filename); }
    return files;
  } else if (sinonDoublistFs.realFsFallback) {
    return fsFallback('readdirSync', arguments);
  }
};

/**
 * Clone the file stub and remove the old one.
 *
 * @param {string} oldPath
 * @param {string} newPath
 * @api private
 */
wrapFs.renameSync = function wrapFsRenameSync(oldPath, newPath) {
  oldPath = rtrimSlash(oldPath);
  newPath = rtrimSlash(newPath);

  const oldPathStub = fileStubMap[oldPath];
  if (!oldPathStub) {
    if (sinonDoublistFs.realFsFallback) {
      return fsFallback('renameSync', arguments);
    } else {
      return; // eslint-disable-line
    }
  }

  const parentName = path.dirname(newPath);

  if (fileStubMap[newPath]) {
    fileStubMap[newPath].unlinkReaddir();
  } else {
    fileStubMap[newPath] = new FileStub();
    fileStubMap[newPath]
      .set('name', newPath)
      .set('parentName', parentName)
      .make();
  }
  log('%s to %s in parent %s', oldPath, newPath, parentName);

  fileStubMap[newPath].set('buffer', oldPathStub.get('buffer'));
  fileStubMap[newPath].set('stats', oldPathStub.get('stats'));

  const parentStub = fileStubMap[parentName];
  if (parentStub) {
    const parentReaddir = parentStub.get('readdir') || [];
    let relPath = oldPath.replace(parentName + '/', '');
    const idx = parentReaddir.indexOf(relPath);
    if (idx !== -1) {
      log('remove %s from readdir of parent %s', relPath, parentName);
      parentReaddir.splice(idx, 1);
      parentStub.readdir(parentReaddir);
    }

    relPath = newPath.replace(parentName + '/', '');
    if (parentReaddir.indexOf(relPath) === -1) {
      log('add %s to readdir of parent %s', relPath, parentName);
      parentReaddir.push(relPath);
      parentStub.readdir(parentReaddir);
    }
  }

  fileStubMap[oldPath].copyTree(newPath);
  fileStubMap[oldPath].unlink();
};

/**
 * Rely on the file stub map for stat objects.
 *
 * @param {string} filename
 * @param {function} cb
 * @api private
 */
wrapFs.stat = function wrapFsStat(filename, cb) {
  filename = rtrimSlash(filename);
  const stub = fileStubMap[filename];
  if (stub) {
    setImmediate(function callbackWithStats() {
      cb(null, hydrateStatsObj(stub));
    });
  } else if (sinonDoublistFs.realFsFallback) {
    fsFallback('stat', arguments);
  }
};

/**
 * Rely on the file stub map for stat objects.
 *
 * @param {string} filename
 * @return {boolean}
 * @api private
 */
wrapFs.statSync = function wrapFsStatSync(filename) {
  filename = rtrimSlash(filename);
  const stub = fileStubMap[filename];
  if (stub) {
    return hydrateStatsObj(stub);
  } else if (sinonDoublistFs.realFsFallback) {
    return fsFallback('statSync', arguments);
  }
};

/**
 * Remove the associated file stub.
 *
 * @param {string} filename
 * @param {function} cb
 * @api private
 */
wrapFs.unlink = function wrapFsUnlink(filename, cb) {
  filename = rtrimSlash(filename);
  if (fileStubMap[filename]) {
    delete fileStubMap[filename];
    setImmediate(function callbackWithNull() {
      cb(null);
    });
  } else if (sinonDoublistFs.realFsFallback) {
    fsFallback('unlink', arguments);
  }
};

/**
 * Remove the associated file stub.
 *
 * @param {string} filename
 * @return {boolean}
 * @api private
 */
wrapFs.unlinkSync = function wrapFsUnlinkSync(filename) {
  filename = rtrimSlash(filename);
  if (fileStubMap[filename]) {
    delete fileStubMap[filename];
  } else if (sinonDoublistFs.realFsFallback) {
    fsFallback('unlinkSync', arguments);
  }
};

/**
 * Save a buffer for later retrieval by `fs.readFile*`.
 *
 * @param {string} filename
 * @param {string|object} data `String` or `Buffer` instance
 * @param {object} [options]
 * @param {function} cb
 * @api private
 */
wrapFs.writeFile = function wrapFsWriteFile(filename, data) {
  const cb = arguments.length === 4 ? arguments[3] : arguments[2];
  const stub = fileStubMap[filename];
  if (stub) {
    stub.buffer(data);
    setImmediate(function callbackWithNull() {
      cb(null);
    });
  } else if (sinonDoublistFs.realFsFallback) {
    fsFallback('writeFile', arguments);
  }
};

/**
 * Save a buffer for later retrieval by `fs.readFile*`.
 *
 * @param {string} filename
 * @param {string|object} data `String` or `Buffer` instance
 * @api private
 */
wrapFs.writeFileSync = function wrapFsWriteFileSync(filename, data) {
  const stub = fileStubMap[filename];
  if (stub) {
    stub.buffer(data);
  } else if (sinonDoublistFs.realFsFallback) {
    fsFallback('writeFileSync', arguments);
  }
};

/**
 * FileStub constructor.
 *
 * An entry in the map of stubbed files/directories.
 *
 * Usage:
 *
 *     const stub = new FileStub();
 *     stub
 *       .set('name', '/path/to/file')
 *       .stat('size', 50)
 *       .stat('gid', 2000)
 *       .make();
 *
 * Configuration:
 *
 * - `{string} name` Absolute path w/out trailing slash
 *   - Trailing slashes will be dropped.
 * - `{boolean|array} readdir` Names of direct descendant files/directories
 *   - `false` will lead to `isFile()` returning `true`
 * - `{string} parentName` Absolute path w/out trailing slash
 * - `{object} stats` Attributes to be returned by `stat*()` and `lstat*()`
 *   - Initial values are from the `fs.Stats` manual entry.
 */
function FileStub() {
  this.settings = {
    name: '',
    buffer: new Buffer(0),
    readdir: false,
    parentName: '',
    stats: {
      dev: 2114,
      ino: 48064969,
      mode: 33188,
      nlink: 1,
      uid: 85,
      gid: 100,
      rdev: 0,
      size: 0,
      blksize: 4096,
      blocks: 0,
      atime: 'Mon, 10 Oct 2011 23:24:11 GMT',
      mtime: 'Mon, 10 Oct 2011 23:24:11 GMT',
      ctime: 'Mon, 10 Oct 2011 23:24:11 GMT'
    }
  };
}

configurable(FileStub.prototype);

/**
 * Set the buffer to be returned by `fs.readFile*`.
 *
 * @param {string|object} buffer `String` or `Buffer` instance
 * @return this
 */
FileStub.prototype.buffer = function fileStubBuffer(buffer) {
  if (is.string(buffer)) {
    buffer = new Buffer(buffer);
  }
  this.stat('size', buffer.length + 1);
  return this.set('buffer', buffer);
};

/**
 * Supply all sub-dir file stubs, recursively, to the iterator.
 *
 * @param {function} cb Iterator that receives the file stub
 */
FileStub.prototype.map = function fileStubMapFn(cb) {
  const name = this.get('name');
  log('name: %s', name);
  const readdir = this.get('readdir');
  if (!readdir) { return; }
  readdir.forEach(function forEachRelPath(relPath) {
    const stub = fileStubMap[name + '/' + relPath];
    if (stub) {
      cb(stub);
      stub.map(cb);
    }
  });
};

/**
 * Recursively copy all files stubs from the source tree, renaming them to reflect
 * the new root directory.
 *
 * @param {string} name New full path
 * @see FileStub.prototype.map
 * @see wrapFs.renameSync
 */
FileStub.prototype.copyTree = function fileStubCopyTree(newName) {
  const oldName = this.get('name');
  log('%s to %s', oldName, newName);
  this.map(function mapStub(stub) {
    const oldChildName = stub.get('name');
    const newChildName = stub.get('name').replace(oldName, newName);
    log('copy child %s to %s', oldChildName, newChildName);
    wrapFs.renameSync(oldChildName, newChildName);
  });
};

/**
 * Set `fs.readdir*` results.
 *
 * @param {string|boolean|array} paths
 * - `false`: revert to default `isFile()=true`
 * - `string`: Relative path of one direct descendant
 * - object `array`: FileStub objects whose `make()` has not yet been called
 * - string `array`: Relative paths of direct descendants
 * @return this
 */
FileStub.prototype.readdir = function fileStubReaddir(paths) {
  const isArray = is.array(paths);
  const isString = is.string(paths);
  if (paths !== false && !isArray && !isString) { // Avoid silent test misconfig.
    throw new Error('invalid readdir config: ' + JSON.stringify(paths));
  }

  const name = this.get('name');
  log('name: %s, path count: %d', name, paths.length || 0);

  if (isArray) {
    if (is.object(paths[0])) { // FileStub array
      const relPaths = [];
      paths.forEach(function forEachPath(stub) {
        const parentName = path.dirname(stub.get('name'));
        const stubRelPath = stub.get('name').replace(parentName + '/', '');
        log(
          'add child %s with parent %s as %s',
          stub.get('name'), parentName, stubRelPath
        );
        relPaths.push(stubRelPath);
        stub.make();
      });
      paths = relPaths;
    } else {
      paths.forEach(function forEachPath(childName) {
        childName = (name === '/' ? name : name + '/') + childName;
        if (fileStubMap[childName]) { return; }
        context.stubFile(childName).make();
      });
    }
  } else if (isString) {
    paths = [paths];
  }

  log('paths: %j', paths);
  return this.set('readdir', paths);
};

/**
 * Set an `fs.Stats` property.
 *
 * @param {string} key Ex. 'size' or 'gid'
 * @param {mixed} val
 * @return this
 */
FileStub.prototype.stat = function fileStubStat(key, val) {
  const stats = this.get('stats');
  if (typeof stats[key] === 'undefined') { // Avoid silent test misconfig.
    throw new Error('invalid fs.Stats property: ' + key);
  }
  stats[key] = val;
  return this.set('stats', stats);
};

/**
 * Finalize the `fs.{exists,lstat,stat,etc.}` stubs based on collected settings.
 *
 * @return {object} this
 */
FileStub.prototype.make = function fileStubMake() {
  const name = this.get('name');
  log(name);

  fileStubMap[name] = this; // For later lookup in fake writeFile, etc.
  this.set('parentName', path.dirname(name));

  return this;
};

/**
 * Undo a prior `make()`.
 */
FileStub.prototype.unlink = function fileStubUnlink() {
  const name = this.get('name');
  log('name: %s', name);
  const parentName = this.get('parentName');
  const relPath = name.replace(parentName + '/', '');

  const parentStub = fileStubMap[parentName];
  if (parentStub) {
    const parentReaddir = parentStub.get('readdir');
    log('removing %s from parent readdir %j', relPath, parentReaddir);
    const idx = parentReaddir.indexOf(relPath);
    if (idx !== -1) {
      parentReaddir.splice(idx, 1);
      parentStub.readdir(parentReaddir);
    }
  }

  delete fileStubMap[name];

  this.unlinkReaddir();
};

/**
 * Unlink stub's readdir list.
 */
FileStub.prototype.unlinkReaddir = function fileStubUnlinkReaddir() {
  const name = this.get('name');
  log('name: %s', name);
  const readdir = this.get('readdir');
  if (readdir) {
    readdir.forEach(function forEachRelPath(relPath) {
      const childName = name + '/' + relPath;
      const childStub = fileStubMap[childName];
      if (childStub) {
        log('unlinked child %s', relPath);
        fileStubMap[childName].unlink();
      } else {
        log('no stub for child %s', relPath);
      }
    });
  }
};

const globalInjector = {
  mocha: function injectWithMocha() {
    beforeEach(function beforeEachMochaTest(hookDone) {
      sinonDoublistFs(this);
      hookDone();
    });
    afterEach(function afterEachMochaTest(hookDone) {
      this.restoreFs();
      hookDone();
    });
  }
};

/**
 * Given an array files and directories, in any order and relationship,
 * return an object describing how to build file trees that contain them
 * all with no directory gaps.
 *
 * Ex. given just '/path/to/file.js', it include '/path' and '/to' in the
 * results.
 *
 * @param {string|array} sparse Normalized, absolute paths
 * @return {object}
 *   Keys: Absolute paths including 'sparse' and any filled 'gaps'.
 *   Values: Arrays of direct descendants' absolute paths.
 * @api private
 */
function intermediatePaths(sparse) {
  const dense = {};
  [].concat(sparse).forEach(function forEachPath(path) {
    path = rtrimSlash(path);
    dense[path] = {}; // Store as keys to omit dupes
    const curParts = trimSlash(path).split('/');
    const gapParts = [];
    curParts.forEach(function forEachPart(part) {
      const parent = '/' + gapParts.join('/');

      gapParts.push(part); // Incrementally include all parts to collect gaps
      const intermediate = '/' + gapParts.join('/');

      if (!dense[intermediate]) { dense[intermediate] = {}; } // Collect gap

      if (!dense[parent]) { dense[parent] = {}; } // Store its relatinship
      if (parent === '/') {
        dense[parent][trimSlash(intermediate.slice(1))] = 1;
      } else {
        // Guard against '' child name from sparse path w/ trailing slash
        const childName = intermediate.replace(parent + '/', '');
        if (childName) {
          dense[parent][childName] = 1;
        }
      }
    });
  });
  Object.keys(dense).forEach(function forEachDensePath(name) {
    dense[name] = Object.keys(dense[name]);
  });
  return dense;
}

function fsFallback(method, args) {
  switch (sinonDoublistFs.realFsFallback) {
    case 1: return realFs[method].apply(realFs, args);
    case 2: throw new Error("%s: no such file stub '%s'", method, args[0]);
  }
}

function hydrateStatsObj(stub) {
  const stubMany = context.stubMany;

  const stats = stub.get('stats');
  const statsObj = new fs.Stats();
  Object.keys(stats).forEach(function forEachStatKey(key) {
    statsObj[key] = stats[key];
  });

  const readdir = stub.get('readdir');
  const isDir = is.array(readdir);

  stubMany(statsObj, 'isDirectory').isDirectory.returns(isDir);
  stubMany(statsObj, 'isFile').isFile.returns(!isDir);

  return statsObj;
}

function trimSlash(str) {
  const reStr = '(^\/|' + rtrimSlashRe.toString().slice(1, -1) + ')';
  return str.replace(new RegExp(reStr), '');
}

function rtrimSlash(str) {
  if (str === '/') { return str; }
  return str.replace(rtrimSlashRe, '');
}
