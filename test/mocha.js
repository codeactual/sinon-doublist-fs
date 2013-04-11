var sinon = require('sinon');
var chai = require('chai');
var sinonDoublistFs = require('../dist/sinon-doublist-fs');
var sinonDoublist = sinonDoublistFs.require('sinon-doublist');
var fs = require('fs');

var should = chai.should();
chai.Assertion.includeStack = true;

sinonDoublist(sinon, 'mocha');
sinonDoublistFs(fs, 'mocha');

describe('sinon-doublist-fs global injection for mocha', function() {
  'use strict';

  it('should set up fs stubbing', function(testDone) {
    fs.writeFile.restore.should.be.a('function');
    this.fsStub.should.be.a('object');
    this.stubFile.should.be.a('function');
    testDone();
  });
});
