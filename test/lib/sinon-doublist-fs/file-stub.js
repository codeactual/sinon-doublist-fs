/*jshint expr:true*/
var T = require('../..');
var fs = T.fs;
var should = T.should;

describe('FileStub', function() {
  describe('#stubTree', function() {
    it('should fill in missing intermediate dirs', function(testDone) {
      var incomplete = [
        '/root',
        '/root/d1/d2/f1.js',
        '/root/d1/d2/d3/d4/f2.js'
      ];
      var complete = [
        '/root',
        '/root/d1',
        '/root/d1/d2',
        '/root/d1/d2/d3',
        '/root/d1/d2/d3/d4',
        '/root/d1/d2/f1.js',
        '/root/d1/d2/d3/d4/f2.js'
      ];
      this.stubTree(incomplete);
      complete.forEach(function(path) {
        fs.existsSync(path).should.equal(true);
      });
      fs.readdirSync('/').should.deep.equal(['root']);
      fs.readdirSync('/root').should.deep.equal(['d1']);
      fs.statSync('/root').isDirectory().should.deep.equal(true);
      fs.readdirSync('/root/d1').should.deep.equal(['d2']);
      fs.statSync('/root/d1').isDirectory().should.deep.equal(true);
      fs.readdirSync('/root/d1/d2').should.deep.equal(['f1.js', 'd3']);
      fs.statSync('/root/d1/d2').isDirectory().should.deep.equal(true);
      fs.statSync('/root/d1/d2/f1.js').isDirectory().should.deep.equal(false);
      fs.readdirSync('/root/d1/d2/d3/d4').should.deep.equal(['f2.js']);
      fs.statSync('/root/d1/d2/d3/d4').isDirectory().should.deep.equal(true);
      fs.statSync('/root/d1/d2/d3/d4/f2.js').isDirectory().should.deep.equal(false);
      testDone();
    });
  });

  describe('#make', function() {
    it('should pass defaults to fs.statsSync', function(testDone) {
      this.stubFile(this.paths[0]).make();
      assertDefaultsMatch(fs.statSync(this.paths[0]));
      testDone();
    });

    it('should pass defaults to fs.stats', function(testDone) {
      this.stubFile(this.paths[0]).make();
      fs.stat(this.paths[0], function(err, stats) {
        T.should.equal(err, null);
        assertDefaultsMatch(stats);
        testDone();
      });
    });

    it('should init parent name', function(testDone) {
      console.log('\x1B[33m<---------- INCOMPLETE'); testDone(); // TODO
    });

    it('should init readdir', function(testDone) {
      console.log('\x1B[33m<---------- INCOMPLETE'); testDone(); // TODO
    });
  });

  describe('#stat', function() {
    it('should set stats property', function(testDone) {
      this.stubFile(this.paths[0]).stat('size', 1).stat('gid', 1000).make();
      fs.statSync(this.paths[0]).size.should.equal(1);
      fs.statSync(this.paths[0]).gid.should.equal(1000);

      // Redefine stats for the same file.
      this.stubFile(this.paths[0]).stat('size', 2).stat('gid', 2000).make();
      fs.statSync(this.paths[0]).size.should.equal(2);
      fs.statSync(this.paths[0]).gid.should.equal(2000);
      testDone();
    });
  });

  describe('#buffer', function() {
    it('should set readFileSync output from string', function(testDone) {
      this.stubFile(this.paths[0]).buffer(this.strings[0]).make();
      fs.readFileSync(this.paths[0]).toString().should.equal(this.strings[0]);
      testDone();
    });

    it('should set readFileSync output from buffer', function(testDone) {
      this.stubFile(this.paths[0]).buffer(new Buffer(this.strings[0])).make();
      fs.readFileSync(this.paths[0]).toString().should.equal(this.strings[0]);
      testDone();
    });

    it('should set readFile output', function(testDone) {
      var self = this;
      this.stubFile(this.paths[0]).buffer(this.strings[0]).make();
      fs.readFile(this.paths[0], function(err, data) {
        T.should.equal(err, null);
        data.toString().should.equal(self.strings[0]);
        testDone();
      });
    });

    it('should set stat size', function(testDone) {
      this.stubFile(this.paths[0]).buffer(this.strings[0]).make();
      fs.statSync(this.paths[0]).size.should.equal(this.strings[0].length + 1);
      testDone();
    });
  });

  describe('#readdir', function() {
    it('should stub readdirSync when passed false', function(testDone) {
      var self = this;
      this.stubFile(this.paths[0]).readdir(false).make();
      (function() {
        fs.readdirSync(self.paths[0]);
      }).should.Throw(Error, 'ENOTDIR, not a directory ' + this.paths[0]);
      testDone();
    });

    it('should stub isFile/isDirectory when passed false', function(testDone) {
      this.stubFile(this.paths[0]).make(); // Without paths.
      var stats = fs.statSync(this.paths[0]);
      stats.isDirectory().should.equal(false);
      stats.isFile().should.equal(true);
      testDone();
    });

    it('should update readdir from path string array', function(testDone) {
      console.log('\x1B[33m<---------- INCOMPLETE'); testDone(); // TODO
    });

    it('should init parent names from path string array', function(testDone) {
      console.log('\x1B[33m<---------- INCOMPLETE'); testDone(); // TODO
    });

    it('should update readdir from FileStub array', function(testDone) {
      console.log('\x1B[33m<---------- INCOMPLETE'); testDone(); // TODO
    });

    it('should init parent names from FileStub array', function(testDone) {
      console.log('\x1B[33m<---------- INCOMPLETE'); testDone(); // TODO
    });

    it('should update stub map from FileStub array', function(testDone) {
      /**
       * Create this tree:
       *
       * /a
       * /a/b
       * /a/b2
       * /a2
       * /a3
       * /a3/b4
       * /a3/b4/c
       *
       */
      this.stubFile(this.paths[0]).readdir([
        this.stubFile(this.paths[0] + '/a').readdir([
          this.stubFile(this.paths[0] + '/a/b'),
          this.stubFile(this.paths[0] + '/a/b2')
        ]),
        this.stubFile(this.paths[0] + '/a2'),
        this.stubFile(this.paths[0] + '/a3').readdir([
          this.stubFile(this.paths[0] + '/a3/b4').readdir([
            this.stubFile(this.paths[0] + '/a3/b4/c')
          ])
        ])
      ]).make();

      // Verify file types and directory contents.
      fs.statSync(this.paths[0] + '/a').isDirectory().should.equal(true);
      fs.readdirSync(this.paths[0] + '/a').should.deep.equal([
        'b',
        'b2'
      ]);
      fs.statSync(this.paths[0] + '/a/b').isFile().should.equal(true);
      fs.statSync(this.paths[0] + '/a/b2').isFile().should.equal(true);
      fs.statSync(this.paths[0] + '/a2').isFile().should.equal(true);
      fs.statSync(this.paths[0] + '/a3').isDirectory().should.equal(true);
      fs.readdirSync(this.paths[0] + '/a3').should.deep.equal([
        'b4'
      ]);
      fs.statSync(this.paths[0] + '/a3/b4').isDirectory().should.equal(true);
      fs.readdirSync(this.paths[0] + '/a3/b4').should.deep.equal([
        'c'
      ]);
      fs.statSync(this.paths[0] + '/a3/b4/c').isFile().should.equal(true);
      testDone();
    });
  });
});

function assertDefaultsMatch(stats) {
  stats.dev.should.equal(2114);
  stats.ino.should.equal(48064969);
  stats.mode.should.equal(33188);
  stats.nlink.should.equal(1);
  stats.uid.should.equal(85);
  stats.gid.should.equal(100);
  stats.rdev.should.equal(0);
  stats.size.should.equal(527);
  stats.blksize.should.equal(4096);
  stats.blocks.should.equal(8);
  var time = 'Mon, 10 Oct 2011 23:24:11 GMT';
  stats.atime.should.equal(time);
  stats.mtime.should.equal(time);
  stats.ctime.should.equal(time);
  stats.isFile().should.equal(true);
  stats.isDirectory().should.equal(false);
}
