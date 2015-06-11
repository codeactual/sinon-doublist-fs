'use strict';

const T = require('./t');

beforeEach(function beforeEachTest() {
  T.sinonDoublist(T.sinon, this);
  T.sinonDoublistFs(this);
});

afterEach(function afterEachTest() {
  this.restoreFs();
  this.sandbox.restore();
});
