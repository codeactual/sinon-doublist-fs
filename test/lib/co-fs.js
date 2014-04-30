require('..');
var T = require('../t');
var should = T.should;

T.sinonDoublist(T.sinon, 'mocha');
var fs = require('co-fs');
T.sinonDoublistFs('mocha');

describe('co-fs compatibility', function() {
  it('should include #writeFile and #readFile', function *() {
    this.stubFile(this.paths[0]).make();
    yield fs.writeFile(this.paths[0], this.strings[0]);
    var written = yield fs.readFile(this.paths[0]);
    written.toString().should.equal(this.strings[0]);
  });
});

