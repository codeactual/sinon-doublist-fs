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
    this.name = '/foo';
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
        fs.exists(self.name, function(exists) {
          should.equal(exists, false);
          taskDone();
        });
      });
      batch.end(function() {
        self.stubFile(self.name).make();
        fs.exists(self.name, function(exists) {
          should.equal(exists, true);
          testDone();
        });
      });
    });
  });

  describe('#existsSync()', function() {
    it('should detect stub', function(testDone) {
      var batch = new Batch();

      should.equal(fs.existsSync(this.name), false);
      this.stubFile(this.name).make();
      should.equal(fs.existsSync(this.name), true);
      testDone();
    });
  });

  describe('#writeFile()', function() {
    it('should update fake file map', function(testDone) {
      console.log('skipped: ' + this.test.title); testDone();
    });
  });

  describe('#writeFileSync()', function() {
    it('should update fake file map', function(testDone) {
      console.log('skipped: ' + this.test.title); testDone();
    });
  });

  describe('#readFile()', function() {
    it('should read fake file map', function(testDone) {
      console.log('skipped: ' + this.test.title); testDone();
    });
  });

  describe('#readFileSync()', function() {
    it('should read fake file map', function(testDone) {
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
    it('should accept string', function(testDone) {
      console.log('skipped: ' + this.test.title); testDone();
    });

    it('should accept buffer', function(testDone) {
      console.log('skipped: ' + this.test.title); testDone();
    });

    it('should set readFile output', function(testDone) {
      console.log('skipped: ' + this.test.title); testDone();
    });

    it('should set readFileSync output', function(testDone) {
      console.log('skipped: ' + this.test.title); testDone();
    });
  });

  describe('FileStub#readdir()', function() {
    it('should stub stats.is*()', function(testDone) {
      console.log('skipped: ' + this.test.title); testDone();
    });
  });
});

