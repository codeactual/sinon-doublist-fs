/* eslint func-names: 0 */
'use strict';

require('..');
const T = require('../t');

T.sinonDoublist(T.sinon, 'mocha');
T.sinonDoublistFs('mocha');

describe('co-fs compatibility', function() {
  it('should include #writeFile and #readFile', function *() {
    const fs = require('co-fs');
    this.stubFile(this.paths[0]).make();
    yield fs.writeFile(this.paths[0], this.strings[0]);
    const written = yield fs.readFile(this.paths[0]);
    written.toString().should.equal(this.strings[0]);
  });
});

