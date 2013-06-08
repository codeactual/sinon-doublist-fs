node.js `fs` mixins for sinon-doublist

_Source: [lib/sinon-doublist-fs/index.js](../lib/sinon-doublist-fs/index.js)_

<a name="tableofcontents"></a>

- <a name="toc_moduleexports"></a><a name="toc_module"></a>[module.exports](#moduleexports)
- <a name="toc_sinondoublistfstest"></a>[sinonDoublistFs](#sinondoublistfstest)
- <a name="toc_mixingetfilestubname"></a><a name="toc_mixin"></a>[mixin.getFileStub](#mixingetfilestubname)
- <a name="toc_mixinstubfilename"></a>[mixin.stubFile](#mixinstubfilename)
- <a name="toc_mixinstubtreepaths"></a>[mixin.stubTree](#mixinstubtreepaths)
- <a name="toc_mixinrestorefs"></a>[mixin.restoreFs](#mixinrestorefs)
- <a name="toc_filestub"></a>[FileStub](#filestub)
- <a name="toc_filestubprototypebufferbuffer"></a><a name="toc_filestubprototype"></a>[FileStub.prototype.buffer](#filestubprototypebufferbuffer)
- <a name="toc_filestubprototypemapcb"></a>[FileStub.prototype.map](#filestubprototypemapcb)
- <a name="toc_filestubprototypecopytreename"></a>[FileStub.prototype.copyTree](#filestubprototypecopytreename)
- <a name="toc_filestubprototypereaddirpaths"></a>[FileStub.prototype.readdir](#filestubprototypereaddirpaths)
- <a name="toc_filestubprototypestatkey-val"></a>[FileStub.prototype.stat](#filestubprototypestatkey-val)
- <a name="toc_filestubprototypemake"></a>[FileStub.prototype.make](#filestubprototypemake)
- <a name="toc_filestubprototypeunlink"></a>[FileStub.prototype.unlink](#filestubprototypeunlink)
- <a name="toc_filestubprototypeunlinkreaddir"></a>[FileStub.prototype.unlinkReaddir](#filestubprototypeunlinkreaddir)

<a name="module"></a>

# module.exports()

> Reference to `sinonDoublistFs()`.

<sub>Go: [TOC](#tableofcontents) | [module](#toc_module)</sub>

# sinonDoublistFs(test)

> Init `fs` stubs.

**Parameters:**

- `{object | string} test` Test context *OR* name of supported test runner
  - `{object}` Context object including `sandbox` from prior `sinonDoublist()` call
  - `{string}` Named runner will be configured to automatically set-up/tear-down.
  - Supported runners: 'mocha'

<sub>Go: [TOC](#tableofcontents)</sub>

<a name="mixin"></a>

# mixin.getFileStub(name)

> Retrieve an existing stub.

**Parameters:**

- `{string} name` Absolute path of file/directory w/out trailing slash

**Return:**

`{object}` [FileStub](#filestub) instance, or undefined if not found.

<sub>Go: [TOC](#tableofcontents) | [mixin](#toc_mixin)</sub>

# mixin.stubFile(name)

> Begin configuring a file stub.

**Usage:**

```js
var stub = this.stubFile('/path/to/file');
stub
  .stat('size', 50)
  .stat('gid', 2000)
  .make();
```

If the test needs ancestor directories to be automatically created/stubbed,
use [mixin.stubTree](#mixinstubtreepaths) instead.

**Parameters:**

- `{string} name` Absolute path of file/directory w/out trailing slash

**Return:**

`{object}` this

<sub>Go: [TOC](#tableofcontents) | [mixin](#toc_mixin)</sub>

# mixin.stubTree(paths)

> Stub a file tree based on a sparse list of absolute paths.

Any missing ancestor directories will be created automatically.

**Usage:**

```js
this.stubTree([
  '/root/a/b2',
  '/root/a2',
  '/root/a3/b4/c'
]);
```

**Parameters:**

- `{array} paths` File/directory absolute paths w/out trailing slashes

<sub>Go: [TOC](#tableofcontents) | [mixin](#toc_mixin)</sub>

# mixin.restoreFs()

> Clean up resources not covered by `sinonDoublist` sandbox restoration.

<sub>Go: [TOC](#tableofcontents) | [mixin](#toc_mixin)</sub>

# FileStub()

> FileStub constructor.

An entry in the map of stubbed files/directories.

**Usage:**

```js
var stub = new FileStub();
stub
  .set('name', '/path/to/file')
  .stat('size', 50)
  .stat('gid', 2000)
  .make();
```

**Configuration:**

- `{string} name` Absolute path w/out trailing slash
- `{boolean|array} readdir` Names of direct descendant files/directories
  - `false` will lead to `isFile()` returning `true`
- `{string} parentName` Absolute path w/out trailing slash
- `{object} stats` Attributes to be returned by `stat*()` and `lstat*()`
  - Initial values are from the `fs.Stats` manual entry.

<sub>Go: [TOC](#tableofcontents)</sub>

<a name="filestubprototype"></a>

# FileStub.prototype.buffer(buffer)

> Set the buffer to be returned by `fs.readFile*`.

**Parameters:**

- `{string | object} buffer` `String` or `Buffer` instance

**Return:**

`{this}`

<sub>Go: [TOC](#tableofcontents) | [FileStub.prototype](#toc_filestubprototype)</sub>

# FileStub.prototype.map(cb)

> Supply all sub-dir file stubs, recursively, to the iterator.

**Parameters:**

- `{function} cb` Iterator that receives the file stub

<sub>Go: [TOC](#tableofcontents) | [FileStub.prototype](#toc_filestubprototype)</sub>

# FileStub.prototype.copyTree(name)

> Recursively copy all files stubs from the source tree, renaming them to reflect
the new root directory.

**Parameters:**

- `{string} name` New full path

**See:**

- [FileStub.prototype.map](#filestubprototypemapcb)
- wrapFs.renameSync

<sub>Go: [TOC](#tableofcontents) | [FileStub.prototype](#toc_filestubprototype)</sub>

# FileStub.prototype.readdir(paths)

> Set `fs.readdir*` results.

**Parameters:**

- `{boolean | array} paths`
  - `false`: revert to default `isFile()=true`
  - object `array`: [FileStub](#filestub) objects whose `make()` has not yet been called
  - string `array`: Relative paths of direct descendants

**Return:**

`{this}`

<sub>Go: [TOC](#tableofcontents) | [FileStub.prototype](#toc_filestubprototype)</sub>

# FileStub.prototype.stat(key, val)

> Set an `fs.Stats` property.

**Parameters:**

- `{string} key` Ex. 'size' or 'gid'
- `{mixed} val`

**Return:**

`{this}`

<sub>Go: [TOC](#tableofcontents) | [FileStub.prototype](#toc_filestubprototype)</sub>

# FileStub.prototype.make()

> Finalize the `fs.{exists,lstat,stat,etc.}` stubs based on collected settings.

**Return:**

`{object}` this

<sub>Go: [TOC](#tableofcontents) | [FileStub.prototype](#toc_filestubprototype)</sub>

# FileStub.prototype.unlink()

> Undo a prior `make()`.

<sub>Go: [TOC](#tableofcontents) | [FileStub.prototype](#toc_filestubprototype)</sub>

# FileStub.prototype.unlinkReaddir()

> Unlink stub's readdir list.

<sub>Go: [TOC](#tableofcontents) | [FileStub.prototype](#toc_filestubprototype)</sub>

_&mdash;generated by [apidox](https://github.com/codeactual/apidox)&mdash;_
