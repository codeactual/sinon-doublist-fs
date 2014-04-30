var T = require('./t');

beforeEach(function() {
  T.sinonDoublist(T.sinon, this);
  T.sinonDoublistFs(this);
});

afterEach(function() {
  this.restoreFs();
  this.sandbox.restore();
});
