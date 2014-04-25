/**
 * node.js `fs` mixins for sinon-doublist
 *
 * Licensed under MIT.
 * Copyright (c) 2013 David Smith <https://github.com/codeactual/>
 */

/*jshint node:true*/
/*global beforeEach:false, afterEach:false*/
'use strict';

/**
 * Reference to `sinonDoublistFs()`.
 */
module.exports = sinonDoublistFs;

var fs = require('fs');
var path = require('path');
var util = require('util');
var sprintf = util.format;

var requireComponent = require('../component/require');
var bind = requireComponent('bind');
var each = requireComponent('component~each');
var clone = requireComponent('clone');
var configurable = requireComponent('configurable.js');
var is = requireComponent('is');

var wrapFs = {}; // Wrapped fs.* methods
var realFs = {}; // Real counterparts to all wrapFs methods
var fileStubMap; // FileStub instances indexed by absolute path
var log; // long-con console logger function
var mixin = {}; // Methods mixed into the test context, ex. stubFile()
var nodeConsole; // NodeConsole instance for creating loggers
var context; // Test context provided to `sinonDoublistFs()`

var rtrimSlashRe = /\/+$/;

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
      .create(null, console.log);
    nodeConsole.traceMethods('FileStub', FileStub, log, null, /^prototype$/);
    nodeConsole.traceMethods('FileStub', FileStub.prototype, log, null, /^(get|set)$/);
    nodeConsole.traceMethods('wrapFs', wrapFs, log);
    nodeConsole.traceMethods('mixin', mixin, log);
  } else {
    log = function() {};
  }

  if (is.string(test)) { globalInjector[test](); return; } // Ex. 'mocha'
  if (is.Function(realFs.exists)) { return; } // Already doubled

  // Mix in stubFile(), stubTree(), etc.
  each(mixin, function(method) { test[method] = bind(test, mixin[method]); });

  // Replace a selection of `fs`
  each(wrapFs, function(method) {
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
mixin.getFileStub = function(name) {
  return fileStubMap[rtrimSlash(name)];
};

/**
 * Begin configuring a file stub.
 *
 * Usage:
 *
 *     var stub = this.stubFile('/path/to/file');
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
mixin.stubFile = function(name) {
  name = rtrimSlash(name);
  log('name: %s', name);
  if (!is.string(name) || name.trim() === '') {
    throw new Error('invalid stubFile() name: ' + JSON.stringify(name));
  }

  var fileStub = new FileStub();
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
mixin.stubTree = function(paths) {
  var self = this;
  var sparse = paths;
  var dense = intermediatePaths(paths);
  var densePaths = Object.keys(dense);

  // Process descendants before their parent in order to detect if the former
  // are also directories.
  densePaths = densePaths.sort(function(a, b) {
    return a.length === b.length ? 0 : (a.length < b.length ? 1 : -1);
  });

  each(densePaths, function(name) {
    var readdir = dense[name];
    if (fileStubMap[name]) { return; }

    if (!readdir.length) {
      // Interpret trailing slash as empty dir
      if (-1 === sparse.indexOf(name + '/')) {
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
mixin.restoreFs = function() {
  Object.keys(wrapFs).forEach(function(method) {
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
wrapFs.exists = function(filename, cb) {
  filename = rtrimSlash(filename);
  if (fileStubMap[filename]) {
    setImmediate(function() {
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
wrapFs.existsSync = function(filename) {
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
wrapFs.lstat = function(filename, cb) {
  filename = rtrimSlash(filename);
  var stub = fileStubMap[filename];
  if (stub) {
    setImmediate(function() {
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
wrapFs.lstatSync = function(filename) {
  filename = rtrimSlash(filename);
  var stub = fileStubMap[filename];
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
wrapFs.readFile = function(filename) {
  var cb = arguments.length === 3 ? arguments[2] : arguments[1];
  var stub = fileStubMap[filename];
  if (stub) {
    setImmediate(function() {
      cb(null, stub.get('buffer'));
    });
  } else if (sinonDoublistFs.realFsFallback) {
    fsFallback('realFile', arguments);
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
wrapFs.readFileSync = function(filename) {
  var stub = fileStubMap[filename];
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
wrapFs.readdir = function(filename, cb) {
  filename = rtrimSlash(filename);
  var stub = fileStubMap[filename];
  if (stub) {
    var files = stub.get('readdir');
    var err = null;
    if (!files) { err = new Error('ENOTDIR, not a directory ' + filename); }
    setImmediate(function() {
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
wrapFs.readdirSync = function(filename) {
  filename = rtrimSlash(filename);
  var stub = fileStubMap[filename];
  if (stub) {
    var files = stub.get('readdir');
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
wrapFs.renameSync = function(oldPath, newPath) {
  oldPath = rtrimSlash(oldPath);
  newPath = rtrimSlash(newPath);

  var oldPathStub = fileStubMap[oldPath];
  if (!oldPathStub) {
    if (sinonDoublistFs.realFsFallback) {
      return fsFallback('renameSync', arguments);
    } else {
      return;
    }
  }

  var parentName = path.dirname(newPath);
  var newPathExists = false;

  if (fileStubMap[newPath]) {
    fileStubMap[newPath].unlinkReaddir();
  } else {
    fileStubMap[newPath] = new FileStub();
    fileStubMap[newPath]
      .set('name', newPath)
      .set('parentName', parentName)
      .make();
    newPathExists = true;
  }
  log('%s to %s in parent %s', oldPath, newPath, parentName);

  fileStubMap[newPath].set('buffer', oldPathStub.get('buffer'));
  fileStubMap[newPath].set('stats', oldPathStub.get('stats'));

  var parentStub = fileStubMap[parentName];
  if (parentStub) {
    var parentReaddir = parentStub.get('readdir');
    parentReaddir = parentReaddir || [];

    var relPath = oldPath.replace(parentName + '/', '');
    var idx = parentReaddir.indexOf(relPath);
    if (-1 !== idx) {
      log('remove %s from readdir of parent %s', relPath, parentName);
      parentReaddir.splice(idx, 1);
      parentStub.readdir(parentReaddir);
    }

    relPath = newPath.replace(parentName + '/', '');
    if (-1 === parentReaddir.indexOf(relPath)) {
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
wrapFs.stat = function(filename, cb) {
  filename = rtrimSlash(filename);
  var stub = fileStubMap[filename];
  if (stub) {
    setImmediate(function() {
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
wrapFs.statSync = function(filename) {
  filename = rtrimSlash(filename);
  var stub = fileStubMap[filename];
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
wrapFs.unlink = function(filename, cb) {
  filename = rtrimSlash(filename);
  if (fileStubMap[filename]) {
    delete fileStubMap[filename];
    setImmediate(function() {
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
wrapFs.unlinkSync = function(filename) {
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
wrapFs.writeFile = function(filename, data) {
  var cb = arguments.length === 4 ? arguments[3] : arguments[2];
  var stub = fileStubMap[filename];
  if (stub) {
    stub.buffer(data);
    setImmediate(function() {
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
wrapFs.writeFileSync = function(filename, data) {
  var stub = fileStubMap[filename];
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
 *     var stub = new FileStub();
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
FileStub.prototype.buffer = function(buffer) {
  if (is.string(buffer)) {
    buffer = new Buffer(buffer);
  }
  var name = this.get('name');
  this.stat('size', buffer.length + 1);
  return this.set('buffer', buffer);
};

/**
 * Supply all sub-dir file stubs, recursively, to the iterator.
 *
 * @param {function} cb Iterator that receives the file stub
 */
FileStub.prototype.map = function(cb) {
  var name = this.get('name');
  log('name: %s', name);
  var readdir = this.get('readdir');
  if (!readdir) { return; }
  readdir.forEach(function(relPath) {
    var stub = fileStubMap[name + '/' + relPath];
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
FileStub.prototype.copyTree = function(newName) {
  var oldName = this.get('name');
  log('%s to %s', oldName, newName);
  this.map(function(stub) {
    var oldChildName = stub.get('name');
    var newChildName = stub.get('name').replace(oldName, newName);
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
FileStub.prototype.readdir = function(paths) {
  var self = this;

  var isArray = is.array(paths);
  var isString = is.string(paths);
  if (false !== paths && !isArray && !isString)  { // Avoid silent test misconfig.
    throw new Error('invalid readdir config: ' + JSON.stringify(paths));
  }

  var name = this.get('name');
  log('name: %s, path count: %d', name, paths.length || 0);

  if (isArray) {
    if (is.object(paths[0])) { // FileStub array
      var relPaths = [];
      paths.forEach(function(stub) {
        var parentName = path.dirname(stub.get('name'));
        var stubRelPath = stub.get('name').replace(parentName + '/', '');
        log(
          'add child %s with parent %s as %s',
          stub.get('name'), parentName, stubRelPath
        );
        relPaths.push(stubRelPath);
        stub.make();
      });
      paths = relPaths;
    } else {
      paths.forEach(function(childName) {
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
FileStub.prototype.stat = function(key, val) {
  var stats = this.get('stats');
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
FileStub.prototype.make = function() {
  var name = this.get('name');
  log(name);

  fileStubMap[name] = this; // For later lookup in fake writeFile, etc.
  this.set('parentName', path.dirname(name));

  return this;
};

/**
 * Undo a prior `make()`.
 */
FileStub.prototype.unlink = function() {
  var name = this.get('name');
  log('name: %s', name);
  var parentName = this.get('parentName');
  var relPath = name.replace(parentName + '/', '');

  var parentStub = fileStubMap[parentName];
  if (parentStub) {
    var parentReaddir = parentStub.get('readdir');
    log('removing %s from parent readdir %j', relPath, parentReaddir);
    var idx = parentReaddir.indexOf(relPath);
    if (-1 !== idx) {
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
FileStub.prototype.unlinkReaddir = function() {
  var name = this.get('name');
  log('name: %s', name);
  var readdir = this.get('readdir');
  if (readdir) {
    readdir.forEach(function(relPath) {
      var childName = name + '/' + relPath;
      var childStub = fileStubMap[childName];
      if (childStub) {
        log('unlinked child %s', relPath);
        fileStubMap[childName].unlink();
      } else {
        log('no stub for child %s', relPath);
      }
    });
  }
};

var globalInjector = {
  mocha: function() {
    beforeEach(function(hookDone) {
      sinonDoublistFs(this);
      hookDone();
    });
    afterEach(function(hookDone) {
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
  var dense = {};
  [].concat(sparse).forEach(function(path) {
    path = rtrimSlash(path);
    dense[path] = {}; // Store as keys to omit dupes
    var curParts = trimSlash(path).split('/');
    var gapParts = [];
    curParts.forEach(function(part) {
      var parent = '/' + gapParts.join('/');

      gapParts.push(part); // Incrementally include all parts to collect gaps
      var intermediate = '/' + gapParts.join('/');

      if (!dense[intermediate]) { dense[intermediate] = {}; } // Collect gap

      if (!dense[parent]) { dense[parent] = {}; } // Store its relatinship
      if ('/' === parent) {
        dense[parent][trimSlash(intermediate.slice(1))] = 1;
      } else {
        // Guard against '' child name from sparse path w/ trailing slash
        var childName = intermediate.replace(parent + '/', '');
        if (childName) {
          dense[parent][childName] = 1;
        }
      }
    });
  });
  each(dense, function(path, children) {
    dense[path] = Object.keys(children);
  });
  return dense;
}

function addInternalProp(obj, name, val) {
  Object.defineProperty(
    obj,
    '__sinonDoublistFs__' + name,
    {value: val, enumerable: false, configurable: false, writable: true}
  );
}
function getInternalProp(obj, name) { return obj['__sinonDoublistFs__' + name]; }

function fsFallback(method, args) {
  switch (sinonDoublistFs.realFsFallback) {
    case 1: return realFs[method].apply(realFs, args);
    case 2: throw new Error("%s: no such file stub '%s'", method, args[0]);
  }
}

function hydrateStatsObj(stub, attrs) {
  var stubMany = context.stubMany;

  var stats = stub.get('stats');
  var statsObj = new fs.Stats();
  each(stats, function(key) {
    statsObj[key] = stats[key];
  });

  var readdir = stub.get('readdir');
  var isDir = is.array(readdir);

  stubMany(statsObj, 'isDirectory').isDirectory.returns(isDir);
  stubMany(statsObj, 'isFile').isFile.returns(!isDir);

  return statsObj;
}

function trimSlash(str) {
  var reStr = '(^\/|' + rtrimSlashRe.toString().slice(1, -1) + ')';
  return str.replace(new RegExp(reStr), '');
}

function rtrimSlash(str) {
  if ('/' === str) { return str; }
  return str.replace(rtrimSlashRe, '');
}
