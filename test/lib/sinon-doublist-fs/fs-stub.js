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
    it('should detect stub', function() {
      should.equal(fs.existsSync(this.paths[0]), false);
      should.equal(fs.existsSync(this.paths[1]), false);
      this.stubFile(this.paths[0]).make();
      this.stubFile(this.paths[1]).make();
      should.equal(fs.existsSync(this.paths[0]), true);
      should.equal(fs.existsSync(this.paths[1]), true);
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
    it('should update fake file map', function() {
      this.stubFile(this.paths[0]).make();
      fs.writeFileSync(this.paths[0], this.strings[0]);
      fs.readFileSync(this.paths[0]).toString().should.equal(this.strings[0]);
    });
  });

  describe('#unlink', function() {
    it('should remove itself from parent readdir', function() {
      this.stubFile(this.paths[0]).readdir(['a']).make();
      fs.readdirSync(this.paths[0]).should.deep.equal(['a']);
      this.getFileStub(this.paths[0] + '/a').unlink();
      fs.readdirSync(this.paths[0]).should.deep.equal([]);
    });

    it.skip('should update #existsSync result', function(testDone) {
    });

    it.skip('should remove itself from stub map', function(testDone) {
    });

    it.skip('should call unlink on child stubs', function(testDone) {
    });
  });

  describe('#renameSync', function() {
    it.skip('should copy readFile buffers', function(testDone) {
    });

    it('should rename copied dir descendants', function() {
      this.stubFile('/root').readdir([
        this.stubFile('/root/a').readdir([
          this.stubFile('/root/a/index.js')
        ])
      ]).make();
      fs.renameSync('/root/a', '/root/b');
      fs.existsSync('/root/a/index.js').should.equal(false);
      fs.statSync('/root/b/index.js').isFile().should.equal(true);
    });

    it('should transpose parent readdir item', function() {
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
    });

    it('should overwrite parent readdir item', function() {
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
    });

    it('should retain own readdir list', function() {
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
    });

    it('should retain own readdir list after overwrite', function() {
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

      fs.readdirSync(this.paths[0] + '/b').should.deep.equal(['c']);
    });

    it.skip('should update parent name of children', function(testDone) {
    });

    it.skip('should retain child meta', function(testDone) {
      // name
      // parent name (should be the parent's new name)
      // size
    });

    it.skip('should update meta', function(testDone) {
      // name
      // parent name
      // size
    });

    it.skip('should update after overwrite', function(testDone) {
      // name
      // parent name
      // size
    });
  });
});

