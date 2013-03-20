/*jshint expr:true*/
var sinon = require('sinon');
var chai = require('chai');
var sinonDoublistFs = require('../build/build');
var sinonDoublist = sinonDoublistFs.require('sinon-doublist');
var fs = require('fs');

var should = chai.should();
chai.Assertion.includeStack = true;

describe('sinon-doublist-fs', function() {
  'use strict';

  beforeEach(function(hookDone) {
    sinonDoublist(sinon, this);
    sinonDoublistFs(fs, this);
    hookDone();
  });

  describe('#stubFile2()', function() {
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

  /*describe('#stubFile()', function() {
    beforeEach(function(hookDone) {
      this.useFakeFs(fs);
      this.name = '/foo';
      hookDone();
    });

    it('should fake size', function(testDone) {
      this.stubFile(this.name, {size: 1234});
      fs.lstat(this.name, function(err, stat) {
        should.equal(err, null);
        stat.size.should.equal(1234);
        testDone();
      });
    });

    it('should allow fs.*stat() method selection', function(testDone) {
      var self = this;
      this.stubFile(this.name, {stat: 'fstat'});
      fs.fstat(this.name, function(err, stat) {
        should.equal(err, null);
        self.fsStub.lstat.should.not.have.been.called;
        self.fsStub.fstat.should.have.been.called;
        testDone();
      });
    });

    it('should fake isDirectory false result', function(testDone) {
      this.stubFile(this.name);
      fs.lstat(this.name, function(err, stat) {
        should.equal(err, null);
        stat.isDirectory().should.equal(false);
        testDone();
      });
    });

    it('should fake isDirectory true result', function(testDone) {
      this.stubFile(this.name, {isDir: true});
      fs.lstat(this.name, function(err, stat) {
        should.equal(err, null);
        stat.isDirectory().should.equal(true);
        testDone();
      });
    });

    it('should let non-empty readdir list imply isDir=true', function(testDone) {
      this.stubFile(this.name, {readdir: ['a']});
      fs.lstat(this.name, function(err, stat) {
        should.equal(err, null);
        stat.isDirectory().should.equal(true);
        testDone();
      });
    });

    it('should fake readdir list', function(testDone) {
      var self = this;
      var expected = ['a', 'b', 'c'];
      this.stubFile(this.name, {isDir: true, readdir: expected});
      fs.lstat(this.name, function(err, stat) {
        should.equal(err, null);
        fs.readdir(self.name, function(err, list) {
          should.equal(err, null);
          list.should.deep.equal(expected);
          testDone();
        });
      });
    });
  });*/
});

