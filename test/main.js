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
    it('should update fake file map w/ string', function(testDone) {
      console.log('skipped: ' + this.test.title); testDone();
    });

    it('should update fake file map w/ buffer', function(testDone) {
      console.log('skipped: ' + this.test.title); testDone();
    });
  });

  describe('#writeFileSync()', function() {
    it('should update fake file map w/ string', function(testDone) {
      console.log('skipped: ' + this.test.title); testDone();
    });

    it('should update fake file map w/ buffer', function(testDone) {
      console.log('skipped: ' + this.test.title); testDone();
    });
  });

  describe('FileStub()', function() {
    it('should use default stats', function(testDone) {
      console.log('skipped: ' + this.test.title); testDone();
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
    it('should stub stats.is*()', function(testDone) {
      console.log('skipped: ' + this.test.title); testDone();
    });
  });
});

