/**
 * node.js `fs` stubbing mixin for sinon-doublist.
 *
 * Licensed under MIT.
 * Copyright (c) 2013 David Smith <https://github.com/codeactual/>
 */

/*jshint node:true*/
/*global beforeEach:false afterEach:false*/
'use strict';

var sinonDoublistFs = module.exports = function(fs, test) {
  if (is.string(test)) {
    globalInjector[test](fs);
    return;
  }

  if (is.Function(fs.exists.restore)) {
    return;
  }

  Object.keys(mixin).forEach(function(method) {
    test[method] = bind(test, mixin[method]);
  });

  test.fsStubOrig = fs;
  test.fsStub = test.stub(fs);

  test.fsStub.Stats.restore();

  test.fsStub.exists.callsArgWith(1, false);
  test.fsStub.existsSync.returns(false);

  Object.keys(fsStubMap).forEach(function(method) {
    test.fsStub[method].restore();
    test.fsStub[method] = test.stub(fs, method, fsStubMap[method]);
  });
};

sinonDoublistFs.require = require; // Give tests access to component loader.

var is = require('is');
var bind = require('bind');
var configurable = require('configurable.js');
var fileMap = {};
var mixin = {};
var fsStubMap = {};

mixin.stubFile = function(name) {
  if (!is.string(name) || name.trim() === '') {
    throw new Error('invalid stubFile() name: ' + JSON.stringify(name));
  }

  var fileStub = new FileStub(this.fsStubOrig, this.fsStub);
  return fileStub.set('name', name).set('sandbox', this);
};

fsStubMap.writeFile = function(filename, data, cb) {
  var stub = fileMap[filename];
  if (stub) {
    stub.buffer(data);
  }
  cb(null);
};

fsStubMap.writeFileSync = function(filename, data) {
  var stub = fileMap[filename];
  if (stub) {
    stub.buffer(data);
  }
};

/**
 * An entry in the map of stubbed files.
 */
function FileStub(fs, fsStub) {
  this.settings = {
    fs: fs,
    fsStub: fsStub,
    sandbox: {},
    name: '',
    readdir: false, // Or array of paths.
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

FileStub.prototype.buffer = function(buffer) {
  if (is.string(buffer)) {
    buffer = new Buffer(buffer);
  }
  var fsStub = this.get('fsStub');
  fsStub.readFileSync.withArgs(this.get('name')).returns(buffer);
  fsStub.readFile.withArgs(this.get('name')).yields(null, buffer);
  return this;
};

FileStub.prototype.readdir = function(files) {
  if (false !== files && !is.array(files))  { // Avoid silent test misconfig.
    throw new Error('invalid readdir config: ' + JSON.stringify(files));
  }
  return this.set('readdir', files);
};

FileStub.prototype.stat = function(key, val) {
  var stats = this.get('stats');
  if (typeof stats[key] === 'undefined') { // Avoid silent test misconfig.
    throw new Error('invalid fs.Stats property: ' + key);
  }
  stats[key] = val;
  return this.set('stats', stats);
};

FileStub.prototype.make = function() {
  var name = this.get('name');
  fileMap[name] = this;

  var fs = this.get('fs');
  var fsStub = this.get('fsStub');
  var stubMany = this.get('sandbox').stubMany;

  fsStub.exists.withArgs(name).yields(true);
  fsStub.existsSync.withArgs(name).returns(true);

  var stats = this.get('stats');
  var statsObj = new fs.Stats();
  Object.keys(stats).forEach(function(key) {
    statsObj[key] = stats[key];
  });
  var paths = this.get('readdir');
  var isDir = is.array(paths);
  stubMany(statsObj, 'isDirectory').isDirectory.returns(isDir);
  stubMany(statsObj, 'isFile').isFile.returns(!isDir);
  fsStub.stat.withArgs(this.get('name')).yields(null, statsObj);
  fsStub.statSync.withArgs(this.get('name')).returns(statsObj);

  paths = isDir ? paths : [];
  fsStub.readdir.withArgs(this.get('name')).yields(null, paths);
  fsStub.readdirSync.withArgs(this.get('name')).returns(paths);
};

var globalInjector = {
  mocha: function(fs) {
    beforeEach(function(hookDone) {
      sinonDoublistFs(fs, this);
      hookDone();
    });
  }
};
