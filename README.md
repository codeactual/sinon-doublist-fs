# sinon-doublist-fs

node.js `fs` mixins for [sinon-doublist](https://github.com/codeactual/sinon-doublist): `stubFile()`, `stubTree()`

[![Build Status](https://travis-ci.org/codeactual/sinon-doublist-fs.png)](https://travis-ci.org/codeactual/sinon-doublist-fs)

## Examples

> All `sinon` sandboxes except fake timers will be created by the both mixin approaches below. ([sinon docs](http://sinonjs.org/docs/#sandbox))

### Mixin with auto-sandboxing (recommended)

```js
sinonDoublist(sinon, 'mocha');
sinonDoublistFs('mocha');

describe('myFunction', function() {
  it('should do something', function() {
    // this.stubFile()
    // this.stubTree()
  });
});
```

### Mixin w/ manual sandboxing

```js
describe('myFunction', function() {
  beforeEach(function() {
    sinonDoublist(sinon, this);
    sinonDoublistFs(this);
  });

  afterEach(function() {
    this.sandbox.restore();
  });

  it('should do something', function() {
    // this.spyFile()
    // this.stubTree()
  });
});
```

### Fake a large file

```js
describe('#validate()', function() {
 it('should detect file that is too large', function() {
    var filename = '/path/to/file';
    this.stubFile(filename).stat('size', 1024 * 1024 * 1024).make();
    var myLib = new MyLib(filename);
    myLib.validate().should.equal(false);
  });
});
```

### Fake a file tree with leaf attributes

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

### Fake a file tree from a sparse path list

> Creates the same hierarchy as the `stubFile()` example above. However, ancestor directories are stubbed automatically.

```js
this.stubTree([
  '/root/a/b2',
  '/root/a2',
  '/root/a3/b4/c'
]);
```

## `fs` coverage

File stubs created by `stubFile() / stubTree()`, and configured via `.stat()` and others, will be reflected/modifiable by:

* `fs.writeFile*`
* `fs.readFile*`
  * Writes can also be faked via [FileStub#buffer()](docs/sinonDoublistFs.md).
* `fs.exists*`
* `fs.readdir*`
* `fs.stat* / fs.lstat*`
  * Including `isFile() / isDirectory()` responses
* `fs.unlink*`
* `fs.renameSync`

If a file stub does not exist for a given path, we fallback to the real `fs` method. To override this behavior:

* `sinonDoublistFs.realFsFallback = 0`
  * Do nothing (async methods will hang).
* `sinonDoublistFs.realFsFallback = 2`
  * Throw an `Error`, ex. `existsSync, no such file stub '/path/to/file'`

## [co-fs](https://github.com/visionmedia/co-fs) compatibility

`co-fs` wrappers just need to be added prior to `sinon-doublist-fs` stubbing. See [test/lib/co-fs.js](test/lib/co-fs.js).

## Installation

### [NPM](https://npmjs.org/package/sinon-doublist-fs)

    npm install sinon-doublist-fs

## API

[Documentation](docs/sinonDoublistFs.md)

## License

  MIT

## Tests

    npm test
