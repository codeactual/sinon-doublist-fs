# 0.2.3

* Upgrade `sinon-doublist`, `long-con`, `apidox`.

# 0.2.2

* Add missing `fs.lstat*` responses for each `FileStub`. Fix incompatibility with `shelljs-0.1.3`.

# 0.2.1

* Remove NPM shrinkwrapping.

# 0.2.0

* Add `stubTree` mixin.
* Remove requirement that `fs` must be passed to `sinonDoublistFs()`.
* Add `fs.renameSync` stub.
* Add `FileStub#unlink`.
* Fix NPM compatibility.

# 0.1.2

* Support file tree building by passing an array of `stubFile()` chains to `.readdir()`.
* Upgrade `codeactual/sinon-doublist` to 0.2.3.

# 0.1.1

* Upgrade `codeactual/sinon-doublist` to 0.2.2.

# 0.1.0

* Add `stubFile` mixin.
