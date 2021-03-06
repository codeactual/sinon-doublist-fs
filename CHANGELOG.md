# 0.6.0

## breaking

- fix(npm): remove `peerDependency`
- refactor(node): Migrate to ES6 features like `let` and `const`
  - Switch to `iojs` as only build target

## non-breaking

- refactor(component): Migrate to NPM-only deps
- refactor(eslint): Migrate to eslint

# 0.5.2

- chore(grunt-horde): Upgrade to 0.3.4

# 0.5.1

- fix(fsFallback): Undefined due to typo

# 0.5.0

- fix(sinon-doublist): Upgrade peer dependency to `0.5.0` to no longer use fake timers by default
- chore(pkg): Upgrade outdated dependencies

# 0.4.7

- fix(FileStub#readdir): Convert string input to array
- chore(npm): Upgrade outdated dependencies

# 0.4.6

- chore(deps): Upgrade sinon-doublist peer dependency to `0.4.2`

# 0.4.5

- fix(writeFile): Detect `options` argument

# 0.4.4

- fix(fs wrappers): Wrap all callbacks w/ setImmediate
- chore(deps): Update NPM dev dependencies

# 0.4.3

- fix(fs stub, readdir): Pass `ENOTDIR` to callback, instead of throwing, to match `fs`

# 0.4.2

- feat(FileStub#readdir): Accept a string argument for single-descendant case
- fix(fs stub): Support trailing slashes in `exists*`, `renameSync`, `unlink*`, `readdir*`, `lstat*`, `stat*`

# 0.4.1

- feat(FileStub#stubFile): Detect empty dir names based on trailing slash
- fix(FileStub): Drop trailing slash during stub create/seek
- fix(FileStub#readdir): Remove extra leading slash from stub keys for top-level paths

# 0.4.0

- Add `unlink*()` wrappers
- By default, fallback on real `fs` methods if file stub not found.
- By default, set stub `size/blocks` values to `0`.
- Fix:
  * `parentName` updating
  * `fs.Stats` copying during `renameSync()`
  * `readdir*()` payload after `renameSync()`

# 0.3.1

- chore(npm): Upgrade outdated dependencies

# 0.3.0

- Upgrade `sinon-doublist` peer dependency to `~0.4.0` (`sinon ~1.7.2`).
- Rely on `sinon-doublist` to enforce `sinon` peer dependency.

# 0.2.3

- Upgrade `sinon-doublist`, `long-con`, `apidox`.

# 0.2.2

- Add missing `fs.lstat*` responses for each `FileStub`. Fix incompatibility with `shelljs-0.1.3`.

# 0.2.1

- Remove NPM shrinkwrapping.

# 0.2.0

- Add `stubTree` mixin.
- Remove requirement that `fs` must be passed to `sinonDoublistFs()`.
- Add `fs.renameSync` stub.
- Add `FileStub#unlink`.
- Fix NPM compatibility.

# 0.1.2

- Support file tree building by passing an array of `stubFile()` chains to `.readdir()`.
- Upgrade `codeactual/sinon-doublist` to 0.2.3.

# 0.1.1

- Upgrade `codeactual/sinon-doublist` to 0.2.2.

# 0.1.0

- Add `stubFile` mixin.
