/* eslint func-names: 0 */
'use strict';

const T = require('./index');

T.sinonDoublist(T.sinon, 'mocha');
T.sinonDoublistFs('mocha');

describe('sinon-doublist-fs global injection for mocha', function() {
  it('should set up fs stubbing', function(testDone) {
    this.stubFile.should.be.a('function');
    testDone();
  });
});
