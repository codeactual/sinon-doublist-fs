/*jshint expr:true*/
var sinon = require('sinon');
var chai = require('chai');
var sinonDoublistFs = require('../build/build');
var sinonDoublist = sinonDoublistFs.require('sinon-doublist');
var Batch = sinonDoublistFs.require('batch');
var fs = require('fs');

var should = chai.should();
chai.Assertion.includeStack = true;

describe('sinon-doublist-fs', function() {
  'use strict';

  beforeEach(function(hookDone) {
    sinonDoublist(sinon, this);
    sinonDoublistFs(fs, this);
    this.names = ['/foo', '/bar'];
    this.strings = ['walking', 'dead'];
    this.buffers = [new Buffer(this.strings[0]), new Buffer(this.strings[1])];
    hookDone();
  });

  afterEach(function(hookDone) {
    this.sandbox.restore();
    hookDone();
  });

  describe('#exists()', function() {
    it('should detect stub', function(testDone) {
      var self = this;
      var batch = new Batch();

      batch.push(function(taskDone) {
        fs.exists(self.names[0], function(exists) {
          should.equal(exists, false);
          taskDone();
        });
      });
      batch.end(function() {
        self.stubFile(self.names[0]).make();
        fs.exists(self.names[0], function(exists) {
          should.equal(exists, true);
          testDone();
        });
      });
    });
  });

  describe('#existsSync()', function() {
    it('should detect stub', function(testDone) {
      should.equal(fs.existsSync(this.names[0]), false);
      this.stubFile(this.names[0]).make();
      should.equal(fs.existsSync(this.names[0]), true);

      should.equal(fs.existsSync(this.names[1]), false);
      this.stubFile(this.names[1]).make();
      should.equal(fs.existsSync(this.names[1]), true);
      testDone();
    });
  });

  describe('#writeFile()', function() {
    it('should update fake file map', function(testDone) {
      var self = this;
      this.stubFile(this.names[0]).make();
      fs.writeFile(this.names[0], this.strings[0], function(err) {
        should.equal(err, null);
        fs.readFileSync(self.names[0]).toString().should.equal(self.strings[0]);
        testDone();
      });
    });
  });

  describe('#writeFileSync()', function() {
    it('should update fake file map', function(testDone) {
      this.stubFile(this.names[0]).make();
      fs.writeFileSync(this.names[0], this.strings[0]);
      fs.readFileSync(this.names[0]).toString().should.equal(this.strings[0]);
      testDone();
    });
  });

  describe('FileStub()', function() {
    function assertDefaultsMatch(stats) {
      stats.dev.should.equal(2114);
      stats.ino.should.equal(48064969);
      stats.mode.should.equal(33188);
      stats.nlink.should.equal(1);
      stats.uid.should.equal(85);
      stats.gid.should.equal(100);
      stats.rdev.should.equal(0);
      stats.size.should.equal(527);
      stats.blksize.should.equal(4096);
      stats.blocks.should.equal(8);
      var time = 'Mon, 10 Oct 2011 23:24:11 GMT';
      stats.atime.should.equal(time);
      stats.mtime.should.equal(time);
      stats.ctime.should.equal(time);
      stats.isFile().should.equal(true);
      stats.isDirectory().should.equal(false);
    }

    it('should pass defaults to fs.statsSync', function(testDone) {
      this.stubFile(this.names[0]).make();
      assertDefaultsMatch(fs.statSync(this.names[0]));
      testDone();
    });

    it('should pass defaults to fs.stats', function(testDone) {
      this.stubFile(this.names[0]).make();
      fs.stat(this.names[0], function(err, stats) {
        should.equal(err, null);
        assertDefaultsMatch(stats);
        testDone();
      });
    });
  });

  describe('FileStub#stat()', function() {
    it('should set stats property', function(testDone) {
      console.log('skipped: ' + this.test.title); testDone();
    });

    it('should set stats is*() method return value', function(testDone) {
      console.log('skipped: ' + this.test.title); testDone();
    });
  });

  describe('FileStub#buffer()', function() {
    it('should set readFileSync output from string', function(testDone) {
      this.stubFile(this.names[0])
        .buffer(this.strings[0])
        .make();
      fs.readFileSync(this.names[0]).toString().should.equal(this.strings[0]);
      testDone();
    });

    it('should set readFileSync output from buffer', function(testDone) {
      this.stubFile(this.names[0])
        .buffer(new Buffer(this.strings[0]))
        .make();
      fs.readFileSync(this.names[0]).toString().should.equal(this.strings[0]);
      testDone();
    });

    it('should set readFile output', function(testDone) {
      var self = this;
      this.stubFile(this.names[0])
        .buffer(this.strings[0])
        .make();
      fs.readFile(this.names[0], function(err, data) {
        should.equal(err, null);
        data.toString().should.equal(self.strings[0]);
        testDone();
      });
    });

  });

  describe('FileStub#readdir()', function() {
    it('should set fs.readdir() contents when passed array', function(testDone) {
      console.log('skipped: ' + this.test.title); testDone();
    });

    it('should set fs.readdirSync() contents when passed array', function(testDone) {
      console.log('skipped: ' + this.test.title); testDone();
    });

    it('should stub stats.is*() when passed array', function(testDone) {
      console.log('skipped: ' + this.test.title); testDone();
    });

    it('should stub stats.is*() when passed false', function(testDone) {
      console.log('skipped: ' + this.test.title); testDone();
    });
  });
});

