# sinon-doublist-fs

node.js `fs` stubbing mixin for [sinon-doublist](https://github.com/codeactual/sinon-doublist).

[![Build Status](https://travis-ci.org/codeactual/sinon-doublist-fs.png)](https://travis-ci.org/codeactual/sinon-doublist-fs)

## Examples

### Single file

```js
sinonDoublist(sinon, 'mocha');
sinonDoublistFs('mocha');

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

### File tree with attributes

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

### File tree from sparse path list

```js
// Creates the same hierarchy as the `stubTree()` example above.
// Ancestor directories will be stubbed automatically.
this.stubTree([
  '/root/a/b2',
  '/root/a2',
  '/root/a3/b4/c'
]);
```

## Stub Behavior

### fs.writeFile* / fs.readFile*

> Writes will be captured and made available to later reads.

Writes can also be made via `.buffer()` described in the [API documentation](docs/sinon-doublist-fs.md).

### fs.exists*

> Responds with `false` for a given path until an associated stub is finalized by `.make()`.

### fs.readdir*

> Responds with paths passes to the `.readdir()` described in the API section.

### fs.stat*

> Responds with `fs.Stats` properties configured via `.stat()` described in the API section. `isFile()/isDirectory()` methods respond based use of `.readdir()`.

## Installation

### [NPM](https://npmjs.org/package/sinon-doublist-fs)

    npm install sinon-doublist-fs

## API

[Documentation](docs/sinon-doublist-fs.md)

## License

  MIT

## Tests

    npm test
