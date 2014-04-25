var T = module.exports = {};

T.sinon = require('sinon');
var chai = require('chai');

T.should = chai.should();
chai.config.includeStack = true;

T.sinonDoublistFs = require('..');
T.sinonDoublist = require('sinon-doublist');
T.fs = require('fs');
T.path = require('path');

T.requireComponent = require('../lib/component/require');
T.Batch = T.requireComponent('batch');

beforeEach(function(hookDone) {
  T.sinonDoublist(T.sinon, this);
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
