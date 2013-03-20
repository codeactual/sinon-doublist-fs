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
  if (typeof test === 'string') {
    globalInjector[test](fs);
    return;
  }

  if (typeof fs.exists.restore === 'function') {
    return;
  }

  Object.keys(mixin).forEach(function(method) {
    test[method] = bind(test, mixin[method]);
  });

  test.fsStub = test.stub(fs);
  test.fsStub.exists.callsArgWith(1, false);
  test.fsStub.existsSync.returns(false);
};

sinonDoublistFs.require = require; // Give tests access to component loader.

var is = require('is');
var bind = require('bind');
var configurable = require('configurable.js');
var fileMap = {};
var mixin = {};

mixin.stubFile = function(name) {
  var fileStub = new FileStub(this.fsStub);
  return fileStub.set('name', name).set('sandbox', this);
};

/**
 * An entry in the map of stubbed files.
 */
function FileStub(fsStub) {
  this.fsStub = fsStub;
  this.settings = {
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

FileStub.prototype.readdir = function(files) {
  if (files === false) {
    // TODO set isFile return
    // TODO set isDirectory return
  } else if (is.array(files)) {
    // TODO set isFile return
    // TODO set isDirectory return
    this.set('readdir', files);
  } else { // Avoid silent test misconfig.
    throw new Error('invalid readdir config: ' + JSON.stringify(files));
  }
};

FileStub.prototype.stat = function(key, val) {
  var isMethods = [
    'File', 'Directory', 'BlockDevice', 'CharacterDevice', 'FIFO', 'Socket'
  ];
  if (-1 === isMethods.indexOf('is' + key)) {
    // TODO set the return value of the is*() stub
    return;
  }

  var stats = this.get('stats');
  if (typeof stats[key] === 'undefined') { // Avoid silent test misconfig.
    throw new Error('invalid fs.Stats property: ' + key);
  }
  stats[key] = val;
  this.set('stats', stats);
};

FileStub.prototype.make = function() {
  var name = this.get('name');
  fileMap[name] = this;
  this.fsStub.exists.withArgs(name).callsArgWith(1, true);
  this.fsStub.existsSync.withArgs(name).returns(true);
};

var globalInjector = {
  mocha: function(fs) {
    beforeEach(function(hookDone) {
      sinonDoublistFs(fs, this);
      hookDone();
    });
  }
};
