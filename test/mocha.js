var T = require('./index');

T.sinonDoublist(T.sinon, 'mocha');
T.sinonDoublistFs('mocha');

describe('sinon-doublist-fs global injection for mocha', function() {
  'use strict';

  it('should set up fs stubbing', function(testDone) {
    T.fs.writeFile.restore.should.be.a('function');
    this.stubFile.should.be.a('function');
    testDone();
  });
});
