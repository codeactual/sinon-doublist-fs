# sinon-doublist-fs

node.js `fs` stubbing mixin for [sinon-doublist](https://github.com/codeactual/sinon-doublist).

[![Build Status](https://travis-ci.org/codeactual/sinon-doublist-fs.png)](https://travis-ci.org/codeactual/sinon-doublist-fs)

## Examples

### Single file

```js
sinonDoublist(sinon, 'mocha');
sinonDoublistFs(fs, 'mocha');

describe('MyLib', function() {
  describe('#validate()', function() {
    it('should detect file that is too large', function() {
      var filename = '/path/to/file';
      this.stubFile(filename).stat('size', 1024 * 1024 * 1024).make();
      var myLib = new MyLib(filename);
      myLib.validate().should.equal(false);
    });
  });
});
```

### File tree

```js
/**
 * /root/a
 * /root/a/b
 * /root/a/b2
 * /root/a2
 * /root/a3
 * /root/a3/b4
 * /root/a3/b4/c
 */
this.stubFile('/root').readdir([
  this.stubFile('/root/a').readdir([
    this.stubFile('/root/a/b').size(100),
    this.stubFile('/root/a/b2').size(50)
  ]),
  this.stubFile('/root/a2').size(10),
  this.stubFile('/root/a3').readdir([
    this.stubFile('/root/a3/b4').readdir([
      this.stubFile('/root/a3/b4/c').size(20)
    ])
  ])
]).make();
```

## Stub Behavior

### fs.writeFile* / fs.readFile*

> Writes will be captured and made available to later reads.

Writes can also be made via `.buffer()` described in the API section.

### fs.exists*

> Responds with `false` for a given path until an associated stub is finalized by `.make()`.

### fs.readdir*

> Responds with paths passes to the `.readdir()` described in the API section.

### fs.stat*

> Responds with `fs.Stats` properties configured via `.stat()` described in the API section. `isFile()/isDirectory()` methods respond based use of `.readdir()`.

## Installation

### [NPM](https://npmjs.org/package/sinon-doublist-fs)

    npm install sinon-doublist-fs

### API only w/ [Component](https://github.com/component/component)

    $ component install codeactual/sinon-doublist-fs

## API

### #sinonDoublistFs(fs, test)

> Mix the function set into the given `test` context object, and immediately stub all `fs` functions. Ex. use in a BDD-style `beforeEach`.

Call after `sinonDoublist()`.

### #sinonDoublistFs(fs, 'mocha')

> Same mixin operation as above but with automatic `beforeEach/afterEach` boilerplating in mocha.

### {object} fsStub

> The above mixin operations will add `this.fsStub` to the test context. It is the product of `this.stub(fs)` and can be used for custom doubling not yet supported here.

### #restoreFs()

> Clean up resources not covered by `sinon.sandbox#restore`. Ex. use in a BDD-style `afterEach`.

### #stubFile(name)

> Begin configuring a file stub. Returns a fluent interface for further configuration.

### .buffer(data) [#stubFile chain]

> Set the buffer to be returned by `fs.readFile*`.

### .stat(key, val) [#stubFile chain]

> Set an `fs.Stats` property to be returned by `fs.stat*`.

### .readdir(paths) [#stubFile chain]

> Set `fs.readdir*` results.

* To fake a directory, pass an array of path strings.
* To fake a tree, pass an array of `stubFile()` chains without final `make()` calls.
* To fake a file again, pass `false`. (Only necessary to overwrite a past array value.)

Omit trailing slashes from path strings.

### .make() [#stubFile chain]

> Finalize the `fs.{exists,stat,etc.}` stubs based on collected settings.

### .unlink() [#stubFile chain]

> Undo make().

## License

  MIT

## Tests

    npm test

## Change Log

### 0.2.0

* Add `fs.renameSync` stub.
* Add `FileStub#unlink`.
* Fix NPM compatibility.

### 0.1.2

* Support file tree building by passing an array of `stubFile()` chains to `.readdir()`.
* Upgrade `codeactual/sinon-doublist` to 0.2.3.

### 0.1.1

* Upgrade `codeactual/sinon-doublist` to 0.2.2.

### 0.1.0

* Add `stubFile` mixin.
