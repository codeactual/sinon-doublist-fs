'use strict';

beforeEach(function beforeEachTest() {
  this.paths = ['/foo', '/bar'];
  this.strings = ['walking', 'dead'];
  this.buffers = [new Buffer(this.strings[0]), new Buffer(this.strings[1])];
});
