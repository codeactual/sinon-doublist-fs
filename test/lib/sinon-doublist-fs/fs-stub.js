/*jshint expr:true*/
var T = require('../..');
var fs = T.fs;
var should = T.should;
var Batch = T.Batch;

describe('fs stub', function() {
  describe('#exists', function() {
    it('should detect stub', function(testDone) {
      var self = this;
      var batch = new Batch();

      batch.push(function(taskDone) {
        fs.exists(self.paths[0], function(exists) {
          should.equal(exists, false);
          taskDone();
        });
      });

      batch.end(function() {
        self.stubFile(self.paths[0]).make();
        fs.exists(self.paths[0], function(exists) {
          should.equal(exists, true);
          testDone();
        });
      });
    });
  });

  describe('#existsSync', function() {
    it('should detect stub', function(testDone) {
      should.equal(fs.existsSync(this.paths[0]), false);
      should.equal(fs.existsSync(this.paths[1]), false);
      this.stubFile(this.paths[0]).make();
      this.stubFile(this.paths[1]).make();
      should.equal(fs.existsSync(this.paths[0]), true);
      should.equal(fs.existsSync(this.paths[1]), true);
      testDone();
    });
  });

  describe('#writeFile', function() {
    it('should update fake file map', function(testDone) {
      var self = this;
      this.stubFile(this.paths[0]).make();
      fs.writeFile(this.paths[0], this.strings[0], function(err) {
        should.equal(err, null);
        fs.readFileSync(self.paths[0]).toString().should.equal(self.strings[0]);
        testDone();
      });
    });
  });

  describe('#writeFileSync', function() {
    it('should update fake file map', function(testDone) {
      this.stubFile(this.paths[0]).make();
      fs.writeFileSync(this.paths[0], this.strings[0]);
      fs.readFileSync(this.paths[0]).toString().should.equal(this.strings[0]);
      testDone();
    });
  });

  describe('#unlink', function() {
    it('should remove itself from parent readdir', function(testDone) {
      console.log('\x1B[33m<---------- INCOMPLETE'); testDone(); // TODO
    });

    it('should update #existsSync result', function(testDone) {
      console.log('\x1B[33m<---------- INCOMPLETE'); testDone(); // TODO
    });

    it('should remove itself from stub map', function(testDone) {
      console.log('\x1B[33m<---------- INCOMPLETE'); testDone(); // TODO
    });

    it('should call unlink on child stubs', function(testDone) {
      console.log('\x1B[33m<---------- INCOMPLETE'); testDone(); // TODO
    });
  });

  describe('#renameSync', function() {
    it('should rename copied dir descendants', function(testDone) {
      this.stubFile('/root').readdir([
        this.stubFile('/root/a').readdir([
          this.stubFile('/root/a/index.js')
        ])
      ]).make();
      fs.renameSync('/root/a', '/root/b');
      fs.existsSync('/root/a/index.js').should.equal(false);
      fs.statSync('/root/b/index.js').isFile().should.equal(true);
      testDone();
    });

    it('should transpose parent readdir item', function(testDone) {
      this.stubFile(this.paths[0]).readdir([
        this.stubFile(this.paths[0] + '/a')
      ]).make();

      fs.existsSync(this.paths[0] + '/a').should.equal(true);
      fs.existsSync(this.paths[0] + '/b').should.equal(false);
      fs.readdirSync(this.paths[0]).should.deep.equal(['a']);

      fs.renameSync(this.paths[0] + '/a', this.paths[0] + '/b');

      fs.existsSync(this.paths[0] + '/a').should.equal(false);
      fs.existsSync(this.paths[0] + '/b').should.equal(true);
      fs.readdirSync(this.paths[0]).should.deep.equal(['b']);
      testDone();
    });

    it('should overwrite parent readdir item', function(testDone) {
      this.stubFile(this.paths[0]).readdir([
        this.stubFile(this.paths[0] + '/a'),
        this.stubFile(this.paths[0] + '/b')
      ]).make();

      fs.existsSync(this.paths[0] + '/a').should.equal(true);
      fs.existsSync(this.paths[0] + '/b').should.equal(true);
      fs.readdirSync(this.paths[0]).should.deep.equal(['a', 'b']);

      fs.renameSync(this.paths[0] + '/a', this.paths[0] + '/b');

      fs.existsSync(this.paths[0] + '/a').should.equal(false);
      fs.existsSync(this.paths[0] + '/b').should.equal(true);
      fs.readdirSync(this.paths[0]).should.deep.equal(['b']);
      testDone();
    });

    it('should retain own readdir list', function(testDone) {
      this.stubFile(this.paths[0]).readdir([
        this.stubFile(this.paths[0] + '/a').readdir([
          this.stubFile(this.paths[0] + '/a/c')
        ])
      ]).make();

      fs.existsSync(this.paths[0] + '/a').should.equal(true);
      fs.existsSync(this.paths[0] + '/b').should.equal(false);
      fs.readdirSync(this.paths[0]).should.deep.equal(['a']);

      fs.renameSync(this.paths[0] + '/a', this.paths[0] + '/b');

      fs.existsSync(this.paths[0] + '/a').should.equal(false);
      fs.existsSync(this.paths[0] + '/b').should.equal(true);
      fs.readdirSync(this.paths[0]).should.deep.equal(['b']);

      fs.readdirSync(this.paths[0] + '/b').should.deep.equal(['c']);
      testDone();
    });

    it('should retain own readdir list after overwrite', function(testDone) {
      this.stubFile(this.paths[0]).readdir([
        this.stubFile(this.paths[0] + '/a').readdir([
          this.stubFile(this.paths[0] + '/a/c')
        ]),
        this.stubFile(this.paths[0] + '/b').readdir([
          this.stubFile(this.paths[0] + '/b/d')
        ])
      ]).make();

      fs.existsSync(this.paths[0] + '/a').should.equal(true);
      fs.existsSync(this.paths[0] + '/b').should.equal(true);
      fs.readdirSync(this.paths[0]).should.deep.equal(['a', 'b']);

      fs.renameSync(this.paths[0] + '/a', this.paths[0] + '/b');

      fs.existsSync(this.paths[0] + '/a').should.equal(false);
      fs.existsSync(this.paths[0] + '/b').should.equal(true);
      fs.readdirSync(this.paths[0]).should.deep.equal(['b']);

      fs.readdirSync(this.paths[0] + '/b').should.deep.equal(['d']);
      testDone();
    });

    it('should update parent name of children', function(testDone) {
      console.log('\x1B[33m<---------- INCOMPLETE'); testDone(); // TODO
    });

    it('should retain child meta', function(testDone) {
      // name
      // parent name (should be the parent's new name)
      // size
      console.log('\x1B[33m<---------- INCOMPLETE'); testDone(); // TODO
    });

    it('should update meta', function(testDone) {
      console.log('\x1B[33m<---------- INCOMPLETE'); testDone(); // TODO
      // name
      // parent name
      // size
    });

    it('should update after overwrite', function(testDone) {
      console.log('\x1B[33m<---------- INCOMPLETE'); testDone(); // TODO
      // name
      // parent name
      // size
    });
  });
});

