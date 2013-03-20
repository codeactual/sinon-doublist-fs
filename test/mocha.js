var sinon = require('sinon');
var chai = require('chai');
var sinonDoublistFs = require('../build/build');
var sinonDoublist = sinonDoublistFs.require('sinon-doublist');

var should = chai.should();
chai.Assertion.includeStack = true;

sinonDoublist(sinon, 'mocha');
sinonDoublistFs('mocha');

describe('sinon-doublist-fs global injection for mocha', function() {
  'use strict';

  it('should set up fs stubbing', function(testDone) {
    console.log('INCOMPLETE: ' + this.test.title); testDone();
  });
});
