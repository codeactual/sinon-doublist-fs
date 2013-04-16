var T = module.exports = {};

T.sinon = require('sinon');
var chai = require('chai');

T.should = chai.should();
chai.Assertion.includeStack = true;

var sdfs = require('..');

T.sinonDoublistFs = sdfs.sinonDoublistFs;
T.sinonDoublist = require('sinon-doublist').sinonDoublist;
T.fs = require('fs');
T.Batch = sdfs.requireComponent('batch');

beforeEach(function(hookDone) {
  T.sinonDoublist(this);
  T.sinonDoublistFs(this);
  this.paths = ['/foo', '/bar'];
  this.strings = ['walking', 'dead'];
  this.buffers = [new Buffer(this.strings[0]), new Buffer(this.strings[1])];
  hookDone();
});

afterEach(function(hookDone) {
  this.restoreFs();
  this.sandbox.restore();
  hookDone();
});
