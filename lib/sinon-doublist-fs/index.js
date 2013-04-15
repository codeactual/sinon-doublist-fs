/**
 * node.js `fs` stubbing mixin for sinon-doublist.
 *
 * Licensed under MIT.
 * Copyright (c) 2013 David Smith <https://github.com/codeactual/>
 */

/*jshint node:true*/
/*global beforeEach:false, afterEach:false*/
'use strict';

module.exports = {
  sinonDoublistFs: sinonDoublistFs,
  requireComponent: require,
  requireNative: null,
  trace: false
};

var fs;
var util;
var nodeConsole; // NodeConsole instance for creating loggers

var is = require('is');
var bind = require('bind');
var clone = require('clone');
var each = require('each');
var configurable = require('configurable.js');

var fileStubMap;
var mixin = {};
var customFsStub = {}; // fs.* methods we directly substitute
var log; // NodeConsole logger function

/**
 * @param {string|object} test Test context (with sinonDoublist sandbox),
 *   or the name of a supported runner to globally configure.
 *   Supported: 'mocha'
 */
function sinonDoublistFs(test) {
  var requireNative = module.exports.requireNative;
  fs = requireNative('fs');
  util = requireNative('util');

  nodeConsole = requireNative('codeactual-node-console').create();
  log = nodeConsole
    .set('time', false)
    .set('traceDepth', true)
    .create(null, console.log);
  nodeConsole.traceMethods('FileStub', FileStub.prototype, log, null, /^(get|set)$/);

  if (is.string(test)) {
    globalInjector[test]();
    return;
  }

  if (is.Function(fs.exists.restore)) { // Already doubled.
    return;
  }

  each(mixin, function(method) { // stubFile(), etc.
    test[method] = bind(test, mixin[method]);
  });

  fileStubMap = {};

  Object.defineProperty(test, 'fsStub', {
    value: test.stub(fs),
    enumerable: false,
    configurable: false,
    writable: true
  });

  Object.defineProperty(test, 'fileStubMap', {
    value: fileStubMap,
    enumerable: false,
    configurable: false,
    writable: true
  });

  // Regain access to original constructor for `fs.stat*` stubbing.
  test.fsStub.Stats.restore();

  // Force all existence checks to fail by default.
  test.fsStub.exists.callsArgWith(1, false);
  test.fsStub.existsSync.returns(false);

  // Replace initial full-object stubs with some custom ones.
  each(customFsStub, function(method) {
    test.fsStub[method].restore();
    test.fsStub[method] = test.stub(fs, method, customFsStub[method]);
  });
}

/**
 * Begin configuring a file stub.
 *
 * @param {string} name File/directory name without trailing slash.
 * @return {object} this
 */
mixin.stubFile = function(name) {
  log('name: %s', name);
  if (!is.string(name) || name.trim() === '') {
    throw new Error('invalid stubFile() name: ' + JSON.stringify(name));
  }

  var fileStub = new FileStub(this.fsStub);
  return fileStub.set('name', name).set('sandbox', this);
};

mixin.stubTree = function(paths) {
  var self = this;
  paths = intermediatePaths(paths);
  each(paths, function(path, readdir) {
    self.stubFile(path)
      .set('readdir', readdir.length ? readdir : false)
      .set('parentName', path)
      .make();
  });
};

/**
 * Clean up resources not covered by sinonDoublist's sandbox restoration.
 */
mixin.restoreFs = function() {
  fileStubMap = null;
};

/**
 * Clone the file stub and remove the old one.
 *
 * @param {string} oldPath
 * @param {string} newPath
 */
customFsStub.renameSync = function(oldPath, newPath) {
  var oldPathStub = fileStubMap[oldPath];
  var parentName = oldPathStub.get('parentName');
  log('%s to %s in parent %s', oldPath, newPath, parentName);

  fileStubMap[newPath] = FileStub.clone(oldPathStub);
  fileStubMap[newPath].set('name', newPath);
  fileStubMap[newPath].make();

  var parentStub = fileStubMap[parentName];
  if (parentStub) {
    var parentReaddir = parentStub.get('readdir');
    var relPath = newPath.replace(parentName + '/', '');
    if (-1 === parentReaddir.indexOf(relPath)) {
      log('add %s to readdir of parent %s', relPath, parentName);
      parentReaddir.push(relPath);
      parentStub.set('readdir', parentReaddir);
      parentStub.make();
    }
  }

  fileStubMap[oldPath].copyTree(newPath);
  fileStubMap[oldPath].unlink();
};

/**
 * Capture passed buffers for later access by `fs.readFile*`.
 *
 * @param {string} filename
 * @param {string|object} data String or Buffer instance.
 * @param {function} cb
 */
customFsStub.writeFile = function(filename, data, cb) {
  var stub = fileStubMap[filename];
  if (stub) {
    stub.buffer(data);
  }
  cb(null);
};

/**
 * Capture passed buffers for later access by `fs.readFile*`.
 *
 * @param {string} filename
 * @param {string|object} data String or Buffer instance.
 */
customFsStub.writeFileSync = function(filename, data) {
  var stub = fileStubMap[filename];
  if (stub) {
    stub.buffer(data);
  }
};

/**
 * An entry in the map of stubbed files.
 */
function FileStub(fsStub) {
  this.settings = {
    name: '',
    readdir: false, // Or array of paths.
    parentName: '',
    fsStub: fsStub,
    sandbox: {}, // sinonDoublist sandbox.
    stats: { // From fs.Stats example in manual.
      dev: 2114,
      ino: 48064969,
      mode: 33188,
      nlink: 1,
      uid: 85,
      gid: 100,
      rdev: 0,
      size: 527,
      blksize: 4096,
      blocks: 8,
      atime: 'Mon, 10 Oct 2011 23:24:11 GMT',
      mtime: 'Mon, 10 Oct 2011 23:24:11 GMT',
      ctime: 'Mon, 10 Oct 2011 23:24:11 GMT'
    }
  };
}

configurable(FileStub.prototype);

/**
 * Create a new FileStub instance based on the settings of the source.
 *
 * @param {object} srcStub
 * @return {object}
 */
FileStub.clone = function(srcStub) {
  var srcName = srcStub.get('name');
  log('source: %s', srcName);
  var dstStub = new FileStub(srcStub.get('fsStub'));
  var simpleObjects = ['stats'];
  each(srcStub.settings, function(key) {
    if (-1 === simpleObjects.indexOf(key)) {
      dstStub.settings[key] = srcStub.settings[key];
    } else {
      dstStub.settings[key] = clone(srcStub.settings[key]);
    }
  });
  return dstStub;
};

/**
 * Set the buffer to be returned by `fs.readFile*`.
 *
 * @param {string|object} buffer String or Buffer instance.
 * @return this
 */
FileStub.prototype.buffer = function(buffer) {
  if (is.string(buffer)) {
    buffer = new Buffer(buffer);
  }
  var name = this.get('name');
  var fsStub = this.get('fsStub');
  fsStub.readFileSync.withArgs(name).returns(buffer);
  fsStub.readFile.withArgs(name).yields(null, buffer);
  this.stat('size', buffer.length + 1);
  return this;
};

/**
 * Map all sub-dir file stubs.
 *
 * @param {string} path
 * @param {function} cb Receives (stub).
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
 * @param {string} name New full path.
 */
FileStub.prototype.copyTree = function(newName) {
  var oldName = this.get('name');
  log('%s to %s', oldName, newName);
  this.map(function(stub) {
    var oldChildName = stub.get('name');
    var newChildName = stub.get('name').replace(oldName, newName);
    log('copy child %s to %s', oldChildName, newChildName);
    fileStubMap[newChildName] = fileStubMap[oldChildName];
    fileStubMap[newChildName].set('name', newChildName);
    fileStubMap[newChildName].make();
    customFsStub.renameSync(oldChildName, newChildName);
  });
};

/**
 * Set `fs.readdir*` results.
 *
 * @param {boolean|array} paths
 *   false: revert to default isFile=true
 *   array: FileStub objects whose make() has not yet been called
 * @return this
 */
FileStub.prototype.readdir = function(paths) {
  var isArray = is.array(paths);
  if (false !== paths && !isArray)  { // Avoid silent test misconfig.
    throw new Error('invalid readdir config: ' + JSON.stringify(paths));
  }

  var name = this.get('name');
  log('name: %s', name);
  if (!isArray) {
    return this.set('readdir', false);
  }

  var relPaths = [];
  paths.forEach(function(stub) {
    var parentName = stub.get('name').replace(/(.*)\/[^/]+$/, '$1');
    var stubRelPath = stub.get('name').replace(parentName + '/', '');
    log(
      'add child %s with parent %s as %s',
      stub.get('name'), parentName, stubRelPath
    );
    relPaths.push(stubRelPath);
    stub.set('parentName', parentName);
    stub.make();
  });
  paths = relPaths;

  return this.set('readdir', paths);
};

/**
 * Set an fs.Stats property.
 *
 * @param {string} key Ex. 'size' or 'gid'.
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
 * Finalize the `fs.{exists,stat,etc.}` stubs based on collected settings.
 */
FileStub.prototype.make = function() {
  var name = this.get('name');
  fileStubMap[name] = this; // For later lookup in fake writeFile, etc.

  var fsStub = this.get('fsStub');
  var stubMany = this.get('sandbox').stubMany;

  fsStub.exists.withArgs(name).yields(true);
  fsStub.existsSync.withArgs(name).returns(true);

  var stats = this.get('stats');
  var statsObj = new fsStub.Stats();
  each(stats, function(key) {
    statsObj[key] = stats[key];
  });

  var readdir = this.get('readdir');
  var isDir = is.array(readdir);

  log('%s with %d children', name, readdir.length);

  stubMany(statsObj, 'isDirectory').isDirectory.returns(isDir);
  stubMany(statsObj, 'isFile').isFile.returns(!isDir);

  fsStub.stat.withArgs(name).yields(null, statsObj);
  fsStub.statSync.withArgs(name).returns(statsObj);

  if (isDir) {
    fsStub.readdir.withArgs(name).yields(null, readdir);
    fsStub.readdirSync.withArgs(name).returns(readdir);
  } else {
    var err = new Error('ENOTDIR, not a directory ' + name);
    fsStub.readdir.withArgs(name).throws(err);
    fsStub.readdirSync.withArgs(name).throws(err);
  }
};

/**
 * Undo make().
 */
FileStub.prototype.unlink = function() {
  var name = this.get('name');
  log('name: %s', name);
  var fsStub = this.get('fsStub');
  var parentName = this.get('parentName');
  var relPath = name.replace(parentName + '/', '');

  var parentStub = fileStubMap[parentName];
  if (parentStub) {
    var parentReaddir = parentStub.get('readdir');
    log('removing %s from parent readdir', relPath);
    parentReaddir.splice(parentReaddir.indexOf(relPath), 1);
    parentStub.set('readdir', parentReaddir);
    parentStub.make();
    fsStub.readdir.withArgs(parentName).yields(null, parentReaddir);
    fsStub.readdirSync.withArgs(parentName).returns(parentReaddir);
  }

  fsStub.exists.withArgs(name).yields(false);
  fsStub.existsSync.withArgs(name).returns(false);

  var err = new Error('ENOENT, no such file or directory \'' + name + '\'');
  fsStub.stat.withArgs(name).throws(err);
  fsStub.statSync.withArgs(name).throws(err);
  fsStub.readdir.withArgs(name).throws(err);
  fsStub.readdirSync.withArgs(name).throws(err);

  delete fileStubMap[name];

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
 * @param {array} sparse Normalized, absolute paths.
 * @return {object}
 *   Keys: Absolute paths including 'sparse' and any filled 'gaps'.
 *   Values: Arrays of direct descendants' absolute paths.
 */
function intermediatePaths(sparse) {
  var dense = {};
  var trimSlashRe = /(^\/|\/+$)/;
  sparse.forEach(function(path) {
    dense[path] = {}; // Store as keys to omit dupes
    var curParts = path.replace(trimSlashRe, '').split('/');
    var gapParts = [];
    curParts.forEach(function(part) {
      var parent = '/' + gapParts.join('/');

      gapParts.push(part); // Incrementally include all parts to collect gaps
      var intermediate = '/' + gapParts.join('/');

      if (!dense[intermediate]) { dense[intermediate] = {}; } // Collect gap

      if (!dense[parent]) { dense[parent] = {}; } // Store its relatinship
      dense[parent][intermediate.replace(parent + '/', '')] = 1;
    });
  });
  each(dense, function(path, children) {
    dense[path] = Object.keys(children);
  });
  return dense;
}
