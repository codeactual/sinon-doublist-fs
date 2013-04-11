/*jshint expr:true*/
var sinon = require('sinon');
var chai = require('chai');
var sinonDoublistFs = require('../dist/sinon-doublist-fs.js');
var sinonDoublist = sinonDoublistFs.require('sinon-doublist');
var Batch = sinonDoublistFs.require('batch');
var fs = require('fs');

var should = chai.should();
chai.Assertion.includeStack = true;

describe('sinon-doublist-fs', function() {
  'use strict';

  beforeEach(function(hookDone) {
    sinonDoublist(sinon, this);
    sinonDoublistFs(fs, this);
    this.paths = ['/foo', '/bar'];
    this.strings = ['walking', 'dead'];
    this.buffers = [new Buffer(this.strings[0]), new Buffer(this.strings[1])];
    hookDone();
  });

  afterEach(function(hookDone) {
    this.restoreFs();
    this.sandbox.restore();
    hookDone();
  });

  describe('#exists()', function() {
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

  describe('#existsSync()', function() {
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

  describe('#writeFile()', function() {
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

  describe('#writeFileSync()', function() {
    it('should update fake file map', function(testDone) {
      this.stubFile(this.paths[0]).make();
      fs.writeFileSync(this.paths[0], this.strings[0]);
      fs.readFileSync(this.paths[0]).toString().should.equal(this.strings[0]);
      testDone();
    });
  });

  describe('FileStub()', function() {
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

    it('should pass defaults to fs.statsSync', function(testDone) {
      this.stubFile(this.paths[0]).make();
      assertDefaultsMatch(fs.statSync(this.paths[0]));
      testDone();
    });

    it('should pass defaults to fs.stats', function(testDone) {
      this.stubFile(this.paths[0]).make();
      fs.stat(this.paths[0], function(err, stats) {
        should.equal(err, null);
        assertDefaultsMatch(stats);
        testDone();
      });
    });
  });

  describe('FileStub#stat()', function() {
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

  describe('FileStub#buffer()', function() {
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
        should.equal(err, null);
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

  describe('FileStub#readdir()', function() {
    it('should set fs.readdir() contents when passed array', function(testDone) {
      var self = this;
      this.stubFile(this.paths[0]).readdir(this.paths).make();
      fs.readdir(this.paths[0], function(err, paths) {
        should.equal(err, null);
        paths.should.deep.equal(self.paths);
        testDone();
      });
    });

    it('should set fs.readdirSync() contents when passed array', function(testDone) {
      this.stubFile(this.paths[0]).readdir(this.paths).make();
      fs.readdirSync(this.paths[0]).should.deep.equal(this.paths);
      testDone();
    });

    it('should stub isFile/isDirectory when passed array', function(testDone) {
      this.stubFile(this.paths[0]).make(); // Without paths.
      var stats = fs.statSync(this.paths[0]);
      stats.isDirectory().should.equal(false);
      stats.isFile().should.equal(true);

      this.stubFile(this.paths[0]).readdir(this.paths).make(); // With paths.
      stats = fs.statSync(this.paths[0]);
      stats.isDirectory().should.equal(true);
      stats.isFile().should.equal(false);
      testDone();
    });

    it('should stub isFile/isDirectory when passed false', function(testDone) {
      var self = this;
      this.stubFile(this.paths[0]).readdir(this.paths).make();
      fs.readdirSync(this.paths[0]).should.deep.equal(this.paths);
      this.stubFile(this.paths[0]).readdir(false).make();
      (function() {
        fs.readdirSync(self.paths[0]);
      }).should.Throw(Error, 'ENOTDIR, not a directory ' + this.paths[0]);
      testDone();
    });

    it('should accept array of FileStub objects to support trees', function(testDone) {
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

  describe('#renameSync()', function() {
    it('should add to stub map with file source', function(testDone) {
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

    it('should overwrite stub map entry with file source', function(testDone) {
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

    it('should add to stub map with dir source', function(testDone) {
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

    it('should overwrite stub map entry with dir source', function(testDone) {
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
      testDone();
    });
  });

});

