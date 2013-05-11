# sinon-doublist-fs

node.js `fs` mixins for [sinon-doublist](https://github.com/codeactual/sinon-doublist): `stubFile()`, `stubTree()`

[![Build Status](https://travis-ci.org/codeactual/sinon-doublist-fs.png)](https://travis-ci.org/codeactual/sinon-doublist-fs)

## Examples

### Mixin (recommended)

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

### Mixin (manual)

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

## Stub Behavior

### `fs.writeFile*`, `fs.readFile*`

> Writes will be captured and made available to later reads.

Writes can also be made via [FileStub#buffer()](docs/sinon-doublist-fs.md).

### `fs.exists*`

> Responds with `false` for a given path until an associated stub is finalized by [FileStub#make()](docs/sinon-doublist-fs.md).

### `fs.readdir*`

> Responds with paths passed to [FileStub#readdir()](docs/sinon-doublist-fs.md).

### `fs.stat*` and `fs.lstat*`

> Responds with `fs.Stats` properties configured via [FileStub#stat()](docs/sinon-doublist-fs.md). `isFile()/isDirectory()` methods respond based use of `.readdir()`.

## Installation

### [NPM](https://npmjs.org/package/sinon-doublist-fs)

    npm install sinon-doublist-fs

## API

[Documentation](docs/sinon-doublist-fs.md)

## License

  MIT

## Tests

    npm test
