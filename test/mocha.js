var sinon = require('sinon');
var chai = require('chai');
var fs = require('fs');

var should = chai.should();
chai.Assertion.includeStack = true;

var sdfs = require('..');
var sinonDoublistFs = sdfs.sinonDoublistFs;
var sinonDoublist = require('sinon-doublist').sinonDoublist;

sinonDoublist(sinon, 'mocha');
sinonDoublistFs('mocha');

describe('sinon-doublist-fs global injection for mocha', function() {
  'use strict';

  it('should set up fs stubbing', function(testDone) {
    fs.writeFile.restore.should.be.a('function');
    this.fsStub.should.be.a('object');
    this.stubFile.should.be.a('function');
    testDone();
  });
});
