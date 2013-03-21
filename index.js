/**
 * node.js `fs` stubbing mixin for sinon-doublist.
 *
 * Licensed under MIT.
 * Copyright (c) 2013 David Smith <https://github.com/codeactual/>
 */

/*jshint node:true*/
/*global beforeEach:false afterEach:false*/
'use strict';

/**
 * @param {object} fs Pre-loaded module.
 * @param {string|object} test Test context (with sinonDoublist sandbox),
 *   or the name of a supported runner to globally configure.
 *   Supported: 'mocha'
 */
var sinonDoublistFs = module.exports = function(fs, test) {
  if (is.string(test)) {
    globalInjector[test](fs);
    return;
  }

  if (is.Function(fs.exists.restore)) { // Already doubled.
    return;
  }

  Object.keys(mixin).forEach(function(method) { // stubFile(), etc.
    test[method] = bind(test, mixin[method]);
  });

  test.fsStub = test.stub(fs);

  // Regain access to original constructor for fs.stat() stubbing.
  test.fsStub.Stats.restore();

  // Force all existence checks to fail by default.
  test.fsStub.exists.callsArgWith(1, false);
  test.fsStub.existsSync.returns(false);

  // Replace initial full-object stubs with some custom ones.
  Object.keys(customFsStub).forEach(function(method) {
    test.fsStub[method].restore();
    test.fsStub[method] = test.stub(fs, method, customFsStub[method]);
  });
};

sinonDoublistFs.require = require; // Give tests access to component loader.

var is = require('is');
var bind = require('bind');
var configurable = require('configurable.js');
var fileStubMap = {};
var mixin = {};
var customFsStub = {};

/**
 * Begin configuring a file stub.
 *
 * @param {string} name File/directory name.
 * @return {object} this
 */
mixin.stubFile = function(name) {
  if (!is.string(name) || name.trim() === '') {
    throw new Error('invalid stubFile() name: ' + JSON.stringify(name));
  }

  var fileStub = new FileStub(this.fsStub);
  return fileStub.set('name', name).set('sandbox', this);
};

/**
 * Replace fs.writeFile() in order to capture passed buffers for later
 * access by fs.readFile*().
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
 * Replace fs.writeFile() in order to capture passed buffers for later
 * access by fs.readFile*().
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
 * Set the buffer to be returned by readFile*() calls.
 *
 * @param {string|object} buffer String or Buffer instance.
 * @return this
 */
FileStub.prototype.buffer = function(buffer) {
  if (is.string(buffer)) {
    buffer = new Buffer(buffer);
  }
  var fsStub = this.get('fsStub');
  fsStub.readFileSync.withArgs(this.get('name')).returns(buffer);
  fsStub.readFile.withArgs(this.get('name')).yields(null, buffer);
  return this;
};

/**
 * Set readdir*() results.
 *
 * @param {boolean|array} Array of strings, or false to revert to default isFile=true.
 * @return this
 */
FileStub.prototype.readdir = function(files) {
  if (false !== files && !is.array(files))  { // Avoid silent test misconfig.
    throw new Error('invalid readdir config: ' + JSON.stringify(files));
  }
  return this.set('readdir', files);
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
 * Finalize the fs.{exists,stat,etc.} stubs based on collected settings.
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
  Object.keys(stats).forEach(function(key) {
    statsObj[key] = stats[key];
  });

  var paths = this.get('readdir');
  var isDir = is.array(paths);

  stubMany(statsObj, 'isDirectory').isDirectory.returns(isDir);
  stubMany(statsObj, 'isFile').isFile.returns(!isDir);

  fsStub.stat.withArgs(this.get('name')).yields(null, statsObj);
  fsStub.statSync.withArgs(this.get('name')).returns(statsObj);

  if (isDir) {
    fsStub.readdir.withArgs(this.get('name')).yields(null, paths);
    fsStub.readdirSync.withArgs(this.get('name')).returns(paths);
  } else {
    var err = new Error('ENOTDIR, not a directory ' + name);
    fsStub.readdir.withArgs(this.get('name')).throws(err)
    fsStub.readdirSync.withArgs(this.get('name')).throws(err);
  }
};

var globalInjector = {
  mocha: function(fs) {
    beforeEach(function(hookDone) {
      sinonDoublistFs(fs, this);
      hookDone();
    });
  }
};
