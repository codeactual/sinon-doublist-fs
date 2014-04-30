/*jshint expr:true*/
require('../..');
require('../../hooks');
var T = require('../../t');

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

    it('should trim leading slashes', function(testDone) {
      this.stubTree('/root/a/index.js');
      fs.exists('/root/a/', function(exists) {
        exists.should.equal(true);
        testDone();
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

    it('should trim leading slashes', function() {
      this.stubTree('/root/a/index.js');
      fs.existsSync('/root/a/').should.equal(true);
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

  describe('#renameSync', function() {
    it('should copy readFile buffers', function() {
      var src = this.stubFile(this.paths[0]).buffer('txt').make();
      var dst = this.stubFile(this.paths[1]).make();
      fs.renameSync(this.paths[0], this.paths[1]);
      fs.readFileSync(this.paths[1]).toString().should.equal('txt');
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

    it('should update parent name of children', function() {
      this.stubFile(this.paths[0]).readdir(['a']).make();
      fs.renameSync(this.paths[0] + '/a', this.paths[0] + '/b');
      fs.readdirSync(this.paths[0]).should.deep.equal(['b']);
    });

    it('should retain meta', function() {
      this.stubFile(this.paths[0]).stat('size', 1024).make();
      fs.renameSync(this.paths[0], this.paths[1]);
      fs.statSync(this.paths[1]).size.should.equal(1024);
    });

    it('should retain child meta', function() {
      this.stubFile(this.paths[0]).readdir([
        this.stubFile(this.paths[0] + '/a').stat('size', 1024)
      ]);
      fs.renameSync(this.paths[0] + '/a', this.paths[0] + '/b');
      fs.statSync(this.paths[0] + '/b').size.should.equal(1024);
    });

    it('should retain meta after overwrite', function() {
      this.stubFile(this.paths[0]).stat('size', 1024).make();
      this.stubFile(this.paths[1]).make();
      fs.renameSync(this.paths[0], this.paths[1]);
      fs.statSync(this.paths[1]).size.should.equal(1024);
    });

    it('should retain child meta after overwrite', function() {
      this.stubFile(this.paths[0]).readdir([
        this.stubFile(this.paths[0] + '/a').stat('size', 1024)
      ]).make();
      this.stubFile(this.paths[1]).readdir([
        this.stubFile(this.paths[1] + '/a')
      ]).make();
      fs.renameSync(this.paths[0], this.paths[1]);
      fs.statSync(this.paths[1] + '/a').size.should.equal(1024);
    });

    it('should trim leading slashes', function() {
      this.stubTree(['/root/a/index.js', '/root/b/']);
      fs.renameSync('/root/a/', '/root/b/');
      fs.existsSync('/root/b/index.js').should.equal(true);
    });
  });

  describe('#unlink', function() {
    it('should remove stub', function(testDone) {
      var self = this;
      this.stubFile(this.paths[0]).make();
      fs.unlink(this.paths[0], function(err) {
        should.equal(err, null);
        fs.existsSync(self.paths[0]).should.equal(false);
        testDone();
      });
    });

    it('should trim leading slashes', function(testDone) {
      this.stubTree('/root/a/index.js');
      fs.unlink('/root/a/', function() {
        fs.existsSync('/root/a/').should.equal(false);
        testDone();
      });
    });
  });

  describe('#unlinkSync', function() {
    it('should detect stub', function() {
      this.stubFile(this.paths[0]).make();
      fs.unlinkSync(this.paths[0]);
      fs.existsSync(this.paths[0]).should.equal(false);
    });

    it('should trim leading slashes', function() {
      this.stubTree('/root/a/index.js');
      fs.unlinkSync('/root/a/');
      fs.existsSync('/root/a/').should.equal(false);
    });
  });

  describe('#readdir', function() {
    it('should trim leading slashes', function(testDone) {
      this.stubTree('/root/a/index.js');
      fs.readdir('/root/a/', function(err, readdir) {
        readdir.should.deep.equal(['index.js']);
        testDone();
      });
    });
  });

  describe('#readdirSync', function() {
    it('should trim leading slashes', function() {
      this.stubTree('/root/a/index.js');
      fs.readdirSync('/root/a/').should.deep.equal(['index.js']);
    });
  });

  describe('#lstat', function() {
    it('should trim leading slashes', function(testDone) {
      this.stubTree('/root/a/index.js');
      fs.lstat('/root/a/', function(err, stats) {
        stats.isDirectory().should.equal(true);
        testDone();
      });
    });
  });

  describe('#lstatSync', function() {
    it('should trim leading slashes', function() {
      this.stubTree('/root/a/index.js');
      fs.lstatSync('/root/a/').isDirectory().should.equal(true);
    });
  });

  describe('#stat', function() {
    it('should trim leading slashes', function(testDone) {
      this.stubTree('/root/a/index.js');
      fs.stat('/root/a/', function(err, stats) {
        stats.isDirectory().should.equal(true);
        testDone();
      });
    });
  });

  describe('#statSync', function() {
    it('should trim leading slashes', function() {
      this.stubTree('/root/a/index.js');
      fs.statSync('/root/a/').isDirectory().should.equal(true);
    });
  });
});

