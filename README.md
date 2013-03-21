# sinon-doublist-fs

node.js `fs` stubbing mixin for [sinon-doublist](https://github.com/codeactual/sinon-doublist).

[![Build Status](https://travis-ci.org/codeactual/sinon-doublist-fs.png)](https://travis-ci.org/codeactual/sinon-doublist-fs)

## Example

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

### [Component](https://github.com/component/component)

Install to `components/`:

    $ component install codeactual/sinon-doublist-fs

Build standalone file in `build/`:

    $ make dist

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

* To make the stub describe a directory, pass an array of path strings.
* To make the stub describe a file again, pass `false`. (Only necessary to overwrite a past array value.)

### .make() [#stubFile chain]

> Finalize the `fs.{exists,stat,etc.}` stubs based on collected settings.

## License

  MIT

## Tests

    npm install --devDependencies
    npm test

## Change Log

### 0.1.0

* Add `stubFile` mixin.
