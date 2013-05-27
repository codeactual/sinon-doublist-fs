node.js `fs` mixins for sinon-doublist

_Source: [lib/sinon-doublist-fs/index.js](../lib/sinon-doublist-fs/index.js)_

<a name="tableofcontents"></a>

- <a name="toc_moduleexports"></a><a name="toc_module"></a>[module.exports](#moduleexports)
- <a name="toc_sinondoublistfstest"></a>[sinonDoublistFs](#sinondoublistfstest)
- <a name="toc_mixingetfilestubname"></a><a name="toc_mixin"></a>[mixin.getFileStub](#mixingetfilestubname)
- <a name="toc_mixinstubfilename"></a>[mixin.stubFile](#mixinstubfilename)
- <a name="toc_mixinstubtreepaths"></a>[mixin.stubTree](#mixinstubtreepaths)
- <a name="toc_mixinrestorefs"></a>[mixin.restoreFs](#mixinrestorefs)
- <a name="toc_wrapfsexistsfilename-cb"></a><a name="toc_wrapfs"></a>[wrapFs.exists](#wrapfsexistsfilename-cb)
- <a name="toc_wrapfsexistssyncfilename"></a>[wrapFs.existsSync](#wrapfsexistssyncfilename)
- <a name="toc_wrapfslstatfilename-cb"></a>[wrapFs.lstat](#wrapfslstatfilename-cb)
- <a name="toc_wrapfslstatsyncfilename"></a>[wrapFs.lstatSync](#wrapfslstatsyncfilename)
- <a name="toc_wrapfsreadfilefilename-args"></a>[wrapFs.readFile](#wrapfsreadfilefilename-args)
- <a name="toc_wrapfsreadfilesyncfilename-options"></a>[wrapFs.readFileSync](#wrapfsreadfilesyncfilename-options)
- <a name="toc_wrapfsreaddirfilename-cb"></a>[wrapFs.readdir](#wrapfsreaddirfilename-cb)
- <a name="toc_wrapfsreaddirsyncfilename"></a>[wrapFs.readdirSync](#wrapfsreaddirsyncfilename)
- <a name="toc_wrapfsrenamesyncoldpath-newpath"></a>[wrapFs.renameSync](#wrapfsrenamesyncoldpath-newpath)
- <a name="toc_wrapfsstatfilename-cb"></a>[wrapFs.stat](#wrapfsstatfilename-cb)
- <a name="toc_wrapfsstatsyncfilename"></a>[wrapFs.statSync](#wrapfsstatsyncfilename)
- <a name="toc_wrapfsunlinkfilename-cb"></a>[wrapFs.unlink](#wrapfsunlinkfilename-cb)
- <a name="toc_wrapfsunlinksyncfilename"></a>[wrapFs.unlinkSync](#wrapfsunlinksyncfilename)
- <a name="toc_wrapfswritefilefilename-data-cb"></a>[wrapFs.writeFile](#wrapfswritefilefilename-data-cb)
- <a name="toc_wrapfswritefilesyncfilename-data"></a>[wrapFs.writeFileSync](#wrapfswritefilesyncfilename-data)
- <a name="toc_filestub"></a>[FileStub](#filestub)
- <a name="toc_filestubprototypebufferbuffer"></a><a name="toc_filestubprototype"></a>[FileStub.prototype.buffer](#filestubprototypebufferbuffer)
- <a name="toc_filestubprototypemapcb"></a>[FileStub.prototype.map](#filestubprototypemapcb)
- <a name="toc_filestubprototypecopytreename"></a>[FileStub.prototype.copyTree](#filestubprototypecopytreename)
- <a name="toc_filestubprototypereaddirpaths"></a>[FileStub.prototype.readdir](#filestubprototypereaddirpaths)
- <a name="toc_filestubprototypestatkey-val"></a>[FileStub.prototype.stat](#filestubprototypestatkey-val)
- <a name="toc_filestubprototypemake"></a>[FileStub.prototype.make](#filestubprototypemake)
- <a name="toc_filestubprototypeunlink"></a>[FileStub.prototype.unlink](#filestubprototypeunlink)

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

<a name="wrapfs"></a>

# wrapFs.exists(filename, cb)

> Rely on the file stub map for existence checks.

**Parameters:**

- `{string} filename`
- `{function} cb`

<sub>Go: [TOC](#tableofcontents) | [wrapFs](#toc_wrapfs)</sub>

# wrapFs.existsSync(filename)

> Rely on the file stub map for existence checks.

**Parameters:**

- `{string} filename`

**Return:**

`{boolean}`

<sub>Go: [TOC](#tableofcontents) | [wrapFs](#toc_wrapfs)</sub>

# wrapFs.lstat(filename, cb)

> Rely on the file stub map for stat objects.

**Parameters:**

- `{string} filename`
- `{function} cb`

<sub>Go: [TOC](#tableofcontents) | [wrapFs](#toc_wrapfs)</sub>

# wrapFs.lstatSync(filename)

> Rely on the file stub map for stat objects.

**Parameters:**

- `{string} filename`

**Return:**

`{boolean}`

<sub>Go: [TOC](#tableofcontents) | [wrapFs](#toc_wrapfs)</sub>

# wrapFs.readFile(filename, args*)

> Rely on the file stub map for buffer retrieval.

**Parameters:**

- `{string} filename`
- `{mixed} args*`

<sub>Go: [TOC](#tableofcontents) | [wrapFs](#toc_wrapfs)</sub>

# wrapFs.readFileSync(filename, [options])

> Rely on the file stub map for buffer retrieval.

**Parameters:**

- `{string} filename`
- `{object} [options]`

**Return:**

`{boolean}`

<sub>Go: [TOC](#tableofcontents) | [wrapFs](#toc_wrapfs)</sub>

# wrapFs.readdir(filename, cb)

> Rely on the file stub map for readdir list.

**Parameters:**

- `{string} filename`
- `{function} cb`

<sub>Go: [TOC](#tableofcontents) | [wrapFs](#toc_wrapfs)</sub>

# wrapFs.readdirSync(filename)

> Rely on the file stub map for readdir list.

**Parameters:**

- `{string} filename`

**Return:**

`{boolean}`

<sub>Go: [TOC](#tableofcontents) | [wrapFs](#toc_wrapfs)</sub>

# wrapFs.renameSync(oldPath, newPath)

> Clone the file stub and remove the old one.

**Parameters:**

- `{string} oldPath`
- `{string} newPath`

<sub>Go: [TOC](#tableofcontents) | [wrapFs](#toc_wrapfs)</sub>

# wrapFs.stat(filename, cb)

> Rely on the file stub map for stat objects.

**Parameters:**

- `{string} filename`
- `{function} cb`

<sub>Go: [TOC](#tableofcontents) | [wrapFs](#toc_wrapfs)</sub>

# wrapFs.statSync(filename)

> Rely on the file stub map for stat objects.

**Parameters:**

- `{string} filename`

**Return:**

`{boolean}`

<sub>Go: [TOC](#tableofcontents) | [wrapFs](#toc_wrapfs)</sub>

# wrapFs.unlink(filename, cb)

> Remove the associated file stub.

**Parameters:**

- `{string} filename`
- `{function} cb`

<sub>Go: [TOC](#tableofcontents) | [wrapFs](#toc_wrapfs)</sub>

# wrapFs.unlinkSync(filename)

> Remove the associated file stub.

**Parameters:**

- `{string} filename`

**Return:**

`{boolean}`

<sub>Go: [TOC](#tableofcontents) | [wrapFs](#toc_wrapfs)</sub>

# wrapFs.writeFile(filename, data, cb)

> Save a buffer for later retrieval by `fs.readFile*`.

**Parameters:**

- `{string} filename`
- `{string | object} data` `String` or `Buffer` instance
- `{function} cb`

<sub>Go: [TOC](#tableofcontents) | [wrapFs](#toc_wrapfs)</sub>

# wrapFs.writeFileSync(filename, data)

> Save a buffer for later retrieval by `fs.readFile*`.

**Parameters:**

- `{string} filename`
- `{string | object} data` `String` or `Buffer` instance

<sub>Go: [TOC](#tableofcontents) | [wrapFs](#toc_wrapfs)</sub>

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
- [wrapFs.renameSync](#wrapfsrenamesyncoldpath-newpath)

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

_&mdash;generated by [apidox](https://github.com/codeactual/apidox)&mdash;_
