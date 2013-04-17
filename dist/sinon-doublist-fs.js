(function() {
    function require(path, parent, orig) {
        var resolved = require.resolve(path);
        if (null == resolved) {
            orig = orig || path;
            parent = parent || "root";
            var err = new Error('Failed to require "' + orig + '" from "' + parent + '"');
            err.path = orig;
            err.parent = parent;
            err.require = true;
            throw err;
        }
        var module = require.modules[resolved];
        if (!module.exports) {
            module.exports = {};
            module.client = module.component = true;
            module.call(this, module.exports, require.relative(resolved), module);
        }
        return module.exports;
    }
    require.modules = {};
    require.aliases = {};
    require.resolve = function(path) {
        if (path.charAt(0) === "/") path = path.slice(1);
        var index = path + "/index.js";
        var paths = [ path, path + ".js", path + ".json", path + "/index.js", path + "/index.json" ];
        for (var i = 0; i < paths.length; i++) {
            var path = paths[i];
            if (require.modules.hasOwnProperty(path)) return path;
        }
        if (require.aliases.hasOwnProperty(index)) {
            return require.aliases[index];
        }
    };
    require.normalize = function(curr, path) {
        var segs = [];
        if ("." != path.charAt(0)) return path;
        curr = curr.split("/");
        path = path.split("/");
        for (var i = 0; i < path.length; ++i) {
            if (".." == path[i]) {
                curr.pop();
            } else if ("." != path[i] && "" != path[i]) {
                segs.push(path[i]);
            }
        }
        return curr.concat(segs).join("/");
    };
    require.register = function(path, definition) {
        require.modules[path] = definition;
    };
    require.alias = function(from, to) {
        if (!require.modules.hasOwnProperty(from)) {
            throw new Error('Failed to alias "' + from + '", it does not exist');
        }
        require.aliases[to] = from;
    };
    require.relative = function(parent) {
        var p = require.normalize(parent, "..");
        function lastIndexOf(arr, obj) {
            var i = arr.length;
            while (i--) {
                if (arr[i] === obj) return i;
            }
            return -1;
        }
        function localRequire(path) {
            var resolved = localRequire.resolve(path);
            return require(resolved, parent, path);
        }
        localRequire.resolve = function(path) {
            var c = path.charAt(0);
            if ("/" == c) return path.slice(1);
            if ("." == c) return require.normalize(p, path);
            var segs = parent.split("/");
            var i = lastIndexOf(segs, "deps") + 1;
            if (!i) i = 0;
            path = segs.slice(0, i + 1).join("/") + "/deps/" + path;
            return path;
        };
        localRequire.exists = function(path) {
            return require.modules.hasOwnProperty(localRequire.resolve(path));
        };
        return localRequire;
    };
    require.register("manuelstofer-each/index.js", function(exports, require, module) {
        "use strict";
        var nativeForEach = [].forEach;
        module.exports = function(obj, iterator, context) {
            if (obj == null) return;
            if (nativeForEach && obj.forEach === nativeForEach) {
                obj.forEach(iterator, context);
            } else if (obj.length === +obj.length) {
                for (var i = 0, l = obj.length; i < l; i++) {
                    if (iterator.call(context, obj[i], i, obj) === {}) return;
                }
            } else {
                for (var key in obj) {
                    if (Object.prototype.hasOwnProperty.call(obj, key)) {
                        if (iterator.call(context, obj[key], key, obj) === {}) return;
                    }
                }
            }
        };
    });
    require.register("codeactual-is/index.js", function(exports, require, module) {
        "use strict";
        var each = require("each");
        var types = [ "Arguments", "Function", "String", "Number", "Date", "RegExp", "Array" ];
        each(types, function(type) {
            var method = type === "Function" ? type : type.toLowerCase();
            module.exports[method] = function(obj) {
                return Object.prototype.toString.call(obj) === "[object " + type + "]";
            };
        });
        if (Array.isArray) {
            module.exports.array = Array.isArray;
        }
        module.exports.object = function(obj) {
            return obj === Object(obj);
        };
    });
    require.register("logicalparadox-goodwin/lib/goodwin.js", function(exports, require, module) {
        var exports = module.exports = {};
        exports.version = "1.1.0";
        exports.getPathValue = function(path, obj) {
            var parsed = parsePath(path);
            return getPathValue(parsed, obj);
        };
        exports.setPathValue = function(path, val, obj) {
            var parsed = parsePath(path);
            setPathValue(parsed, val, obj);
        };
        function defined(val) {
            return "undefined" === typeof val;
        }
        function parsePath(path) {
            var str = path.replace(/\[/g, ".["), parts = str.match(/(\\\.|[^.]+?)+/g);
            return parts.map(function(value) {
                var re = /\[(\d+)\]$/, mArr = re.exec(value);
                if (mArr) return {
                    i: parseFloat(mArr[1])
                }; else return {
                    p: value
                };
            });
        }
        function getPathValue(parsed, obj) {
            var tmp = obj, res;
            for (var i = 0, l = parsed.length; i < l; i++) {
                var part = parsed[i];
                if (tmp) {
                    if (!defined(part.p)) tmp = tmp[part.p]; else if (!defined(part.i)) tmp = tmp[part.i];
                    if (i == l - 1) res = tmp;
                } else {
                    res = undefined;
                }
            }
            return res;
        }
        function setPathValue(parsed, val, obj) {
            var tmp = obj;
            for (var i = 0, l = parsed.length; i < l; i++) {
                var part = parsed[i];
                if (!defined(tmp)) {
                    if (i == l - 1) {
                        if (!defined(part.p)) tmp[part.p] = val; else if (!defined(part.i)) tmp[part.i] = val;
                    } else {
                        if (!defined(part.p) && tmp[part.p]) tmp = tmp[part.p]; else if (!defined(part.i) && tmp[part.i]) tmp = tmp[part.i]; else {
                            var next = parsed[i + 1];
                            if (!defined(part.p)) {
                                tmp[part.p] = {};
                                tmp = tmp[part.p];
                            } else if (!defined(part.i)) {
                                tmp[part.i] = [];
                                tmp = tmp[part.i];
                            }
                        }
                    }
                } else {
                    if (i == l - 1) tmp = val; else if (!defined(part.p)) tmp = {}; else if (!defined(part.i)) tmp = [];
                }
            }
        }
    });
    require.register("codeactual-sinon-doublist/index.js", function(exports, require, module) {
        "use strict";
        var sinonDoublist = module.exports = function(sinon, test, disableAutoSandbox) {
            if (typeof test === "string") {
                globalInjector[test](sinon, disableAutoSandbox);
                return;
            }
            Object.keys(mixin).forEach(function(method) {
                test[method] = bind(test, mixin[method]);
            });
            if (!disableAutoSandbox) {
                test._createSandbox(sinon);
            }
        };
        var is = require("is");
        var bind = require("bind");
        var goodwin = require("goodwin");
        var setPathValue = goodwin.setPathValue;
        var getPathValue = goodwin.getPathValue;
        var mixin = {};
        var browserEnv = typeof window === "object";
        mixin._createSandbox = function(sinon) {
            var self = this;
            this.sandbox = sinon.sandbox.create();
            this.spy = bind(self.sandbox, this.sandbox.spy);
            this.stub = bind(self.sandbox, this.sandbox.stub);
            this.mock = bind(self.sandbox, this.sandbox.mock);
            this.clock = this.sandbox.useFakeTimers();
            this.server = this.sandbox.useFakeServer();
            if (browserEnv) {
                this.requests = this.server.requests;
            }
        };
        mixin.restoreSandbox = function() {
            this.sandbox.restore();
        };
        mixin.spyMany = function(obj, methods) {
            return mixin._doubleMany.call(this, "spy", obj, methods);
        };
        mixin.stubMany = function(obj, methods) {
            return mixin._doubleMany.call(this, "stub", obj, methods);
        };
        mixin.stubWithReturn = function(config) {
            config = config || {};
            var self = this;
            var stub;
            var returns;
            var isReturnsConfigured = config.hasOwnProperty("returns");
            var payload = {};
            if (!is.string(config.method) || !config.method.length) {
                throw new Error("method not specified");
            }
            if (config.obj) {
                stub = this.stub(config.obj, config.method);
            } else {
                config.obj = {};
                stub = this.stubMany(config.obj, config.method)[config.method];
            }
            if (is.array(config.args) && config.args.length) {
                stub = stub.withArgs.apply(stub, config.args);
            }
            if (config.spies) {
                returns = {};
                if (is.string(config.spies) && /\./.test(config.spies)) {
                    setPathValue(config.spies, this.spy(), returns);
                } else {
                    var spies = [].concat(config.spies);
                    for (var s = 0; s < spies.length; s++) {
                        returns[spies[s]] = self.spy();
                    }
                }
            } else {
                if (isReturnsConfigured) {
                    returns = config.returns;
                } else {
                    returns = this.spy();
                }
            }
            stub.returns(returns);
            if (!isReturnsConfigured) {
                if (is.Function(returns)) {
                    payload.returnedSpy = returns;
                } else {
                    payload.returnedSpies = returns;
                }
            }
            payload[config.method] = stub;
            payload.target = config.obj;
            return payload;
        };
        mixin._doubleMany = function(type, obj, methods) {
            var self = this;
            var doubles = {};
            methods = [].concat(methods);
            for (var m = 0; m < methods.length; m++) {
                var method = methods[m];
                if (!getPathValue(method, obj)) {
                    setPathValue(method, sinonDoublistNoOp, obj);
                }
                if (/\./.test(method)) {
                    var lastNsPart = method.split(".").slice(-1);
                    doubles[method] = self[type](getPathValue(method.split(".").slice(0, -1).join("."), obj), method.split(".").slice(-1));
                } else {
                    doubles[method] = self[type](obj, method);
                }
            }
            return doubles;
        };
        var globalInjector = {
            mocha: function(sinon, disableAutoSandbox) {
                beforeEach(function(done) {
                    sinonDoublist(sinon, this, disableAutoSandbox);
                    done();
                });
                afterEach(function(done) {
                    this.sandbox.restore();
                    done();
                });
            }
        };
        function sinonDoublistNoOp() {}
    });
    require.register("component-bind/index.js", function(exports, require, module) {
        var slice = [].slice;
        module.exports = function(obj, fn) {
            if ("string" == typeof fn) fn = obj[fn];
            if ("function" != typeof fn) throw new Error("bind() requires a function");
            var args = [].slice.call(arguments, 2);
            return function() {
                return fn.apply(obj, args.concat(slice.call(arguments)));
            };
        };
    });
    require.register("visionmedia-configurable.js/index.js", function(exports, require, module) {
        module.exports = function(obj) {
            obj.settings = {};
            obj.set = function(name, val) {
                if (1 == arguments.length) {
                    for (var key in name) {
                        this.set(key, name[key]);
                    }
                } else {
                    this.settings[name] = val;
                }
                return this;
            };
            obj.get = function(name) {
                return this.settings[name];
            };
            obj.enable = function(name) {
                return this.set(name, true);
            };
            obj.disable = function(name) {
                return this.set(name, false);
            };
            obj.enabled = function(name) {
                return !!this.get(name);
            };
            obj.disabled = function(name) {
                return !this.get(name);
            };
            return obj;
        };
    });
    require.register("component-type/index.js", function(exports, require, module) {
        var toString = Object.prototype.toString;
        module.exports = function(val) {
            switch (toString.call(val)) {
              case "[object Function]":
                return "function";

              case "[object Date]":
                return "date";

              case "[object RegExp]":
                return "regexp";

              case "[object Arguments]":
                return "arguments";

              case "[object Array]":
                return "array";

              case "[object String]":
                return "string";
            }
            if (val === null) return "null";
            if (val === undefined) return "undefined";
            if (val && val.nodeType === 1) return "element";
            if (val === Object(val)) return "object";
            return typeof val;
        };
    });
    require.register("component-clone/index.js", function(exports, require, module) {
        var type;
        try {
            type = require("type");
        } catch (e) {
            type = require("type-component");
        }
        module.exports = clone;
        function clone(obj) {
            switch (type(obj)) {
              case "object":
                var copy = {};
                for (var key in obj) {
                    if (obj.hasOwnProperty(key)) {
                        copy[key] = clone(obj[key]);
                    }
                }
                return copy;

              case "array":
                var copy = new Array(obj.length);
                for (var i = 0, l = obj.length; i < l; i++) {
                    copy[i] = clone(obj[i]);
                }
                return copy;

              case "regexp":
                var flags = "";
                flags += obj.multiline ? "m" : "";
                flags += obj.global ? "g" : "";
                flags += obj.ignoreCase ? "i" : "";
                return new RegExp(obj.source, flags);

              case "date":
                return new Date(obj.getTime());

              default:
                return obj;
            }
        }
    });
    require.register("component-each/index.js", function(exports, require, module) {
        var type = require("type");
        var has = Object.prototype.hasOwnProperty;
        module.exports = function(obj, fn) {
            switch (type(obj)) {
              case "array":
                return array(obj, fn);

              case "object":
                if ("number" == typeof obj.length) return array(obj, fn);
                return object(obj, fn);

              case "string":
                return string(obj, fn);
            }
        };
        function string(obj, fn) {
            for (var i = 0; i < obj.length; ++i) {
                fn(obj.charAt(i), i);
            }
        }
        function object(obj, fn) {
            for (var key in obj) {
                if (has.call(obj, key)) {
                    fn(key, obj[key]);
                }
            }
        }
        function array(obj, fn) {
            for (var i = 0; i < obj.length; ++i) {
                fn(obj[i], i);
            }
        }
    });
    require.register("sinon-doublist-fs/lib/sinon-doublist-fs/index.js", function(exports, require, module) {
        "use strict";
        module.exports = {
            sinonDoublistFs: sinonDoublistFs,
            requireComponent: require,
            requireNative: null,
            trace: false
        };
        var fs;
        var path;
        var util;
        var nodeConsole;
        var is = require("is");
        var bind = require("bind");
        var clone = require("clone");
        var each = require("each");
        var configurable = require("configurable.js");
        var fileStubMap;
        var mixin = {};
        var customFsStub = {};
        var log;
        var sandbox;
        var fsStub;
        function sinonDoublistFs(test) {
            var requireNative = module.exports.requireNative;
            fs = requireNative("fs");
            path = requireNative("path");
            util = requireNative("util");
            if (module.exports.trace) {
                nodeConsole = requireNative("codeactual-node-console").create();
                log = nodeConsole.set("time", false).set("traceDepth", true).create(null, console.log);
                nodeConsole.traceMethods("FileStub", FileStub, log, null, /^prototype$/);
                nodeConsole.traceMethods("FileStub", FileStub.prototype, log, null, /^(get|set)$/);
                nodeConsole.traceMethods("customFsStub", customFsStub, log);
                nodeConsole.traceMethods("mixin", mixin, log);
            } else {
                log = function() {};
            }
            if (is.string(test)) {
                globalInjector[test]();
                return;
            }
            if (is.Function(fs.exists.restore)) {
                return;
            }
            each(mixin, function(method) {
                test[method] = bind(test, mixin[method]);
            });
            fsStub = test.stub(fs);
            fsStub.Stats.restore();
            fsStub.exists.callsArgWith(1, false);
            fsStub.existsSync.returns(false);
            each(customFsStub, function(method) {
                fsStub[method].restore();
                fsStub[method] = test.stub(fs, method, customFsStub[method]);
            });
            fileStubMap = {};
            sandbox = test;
        }
        mixin.stubFile = function(name) {
            log("name: %s", name);
            if (!is.string(name) || name.trim() === "") {
                throw new Error("invalid stubFile() name: " + JSON.stringify(name));
            }
            var fileStub = new FileStub();
            return fileStub.set("name", name);
        };
        mixin.stubTree = function(paths) {
            var self = this;
            paths = intermediatePaths(paths);
            each(paths, function(name, readdir) {
                self.stubFile(name).readdir(readdir.length ? readdir : false).set("parentName", path.dirname(name)).make();
            });
        };
        mixin.restoreFs = function() {
            fileStubMap = null;
        };
        customFsStub.renameSync = function(oldPath, newPath) {
            var oldPathStub = fileStubMap[oldPath];
            var parentName = path.dirname(newPath);
            var newPathExists = false;
            if (!fileStubMap[newPath]) {
                fileStubMap[newPath] = new FileStub();
                fileStubMap[newPath].set("name", newPath).set("parentName", parentName).make();
                newPathExists = true;
            }
            log("%s to %s in parent %s", oldPath, newPath, parentName);
            var parentStub = fileStubMap[parentName];
            if (parentStub) {
                var parentReaddir = parentStub.get("readdir");
                var relPath = newPath.replace(parentName + "/", "");
                parentReaddir = parentReaddir || [];
                if (-1 === parentReaddir.indexOf(relPath)) {
                    log("add %s to readdir of parent %s", relPath, parentName);
                    parentReaddir.push(relPath);
                    parentStub.readdir(parentReaddir);
                }
            }
            fileStubMap[oldPath].copyTree(newPath);
            fileStubMap[oldPath].unlink();
        };
        customFsStub.writeFile = function(filename, data, cb) {
            var stub = fileStubMap[filename];
            if (stub) {
                stub.buffer(data);
            }
            cb(null);
        };
        customFsStub.writeFileSync = function(filename, data) {
            var stub = fileStubMap[filename];
            if (stub) {
                stub.buffer(data);
            }
        };
        function FileStub(fsStub) {
            this.settings = {
                name: "",
                readdir: false,
                parentName: "",
                stats: {
                    dev: 2114,
                    ino: 48064969,
                    mode: 33188,
                    nlink: 1,
                    uid: 85,
                    gid: 100,
                    rdev: 0,
                    size: 527,
                    blksize: 4096,
                    blocks: 8,
                    atime: "Mon, 10 Oct 2011 23:24:11 GMT",
                    mtime: "Mon, 10 Oct 2011 23:24:11 GMT",
                    ctime: "Mon, 10 Oct 2011 23:24:11 GMT"
                }
            };
        }
        configurable(FileStub.prototype);
        FileStub.prototype.buffer = function(buffer) {
            if (is.string(buffer)) {
                buffer = new Buffer(buffer);
            }
            var name = this.get("name");
            fsStub.readFileSync.withArgs(name).returns(buffer);
            fsStub.readFile.withArgs(name).yields(null, buffer);
            this.stat("size", buffer.length + 1);
            return this;
        };
        FileStub.prototype.map = function(cb) {
            var name = this.get("name");
            log("name: %s", name);
            var readdir = this.get("readdir");
            if (!readdir) {
                return;
            }
            readdir.forEach(function(relPath) {
                var stub = fileStubMap[name + "/" + relPath];
                if (stub) {
                    cb(stub);
                    stub.map(cb);
                }
            });
        };
        FileStub.prototype.copyTree = function(newName) {
            var oldName = this.get("name");
            log("%s to %s", oldName, newName);
            this.map(function(stub) {
                var oldChildName = stub.get("name");
                var newChildName = stub.get("name").replace(oldName, newName);
                log("copy child %s to %s", oldChildName, newChildName);
                customFsStub.renameSync(oldChildName, newChildName);
            });
        };
        FileStub.prototype.readdir = function(paths) {
            var isArray = is.array(paths);
            if (false !== paths && !isArray) {
                throw new Error("invalid readdir config: " + JSON.stringify(paths));
            }
            var name = this.get("name");
            log("name: %s", name);
            if (isArray) {
                if (is.object(paths[0])) {
                    var relPaths = [];
                    paths.forEach(function(stub) {
                        var parentName = path.dirname(stub.get("name"));
                        var stubRelPath = stub.get("name").replace(parentName + "/", "");
                        log("add child %s with parent %s as %s", stub.get("name"), parentName, stubRelPath);
                        relPaths.push(stubRelPath);
                        stub.set("parentName", parentName);
                        stub.make();
                    });
                    paths = relPaths;
                }
                fsStub.readdir.withArgs(name).yields(null, paths);
                fsStub.readdirSync.withArgs(name).returns(paths);
            } else {
                var err = new Error("ENOTDIR, not a directory " + name);
                fsStub.readdir.withArgs(name).throws(err);
                fsStub.readdirSync.withArgs(name).throws(err);
            }
            return this.set("readdir", paths);
        };
        FileStub.prototype.stat = function(key, val) {
            var stats = this.get("stats");
            if (typeof stats[key] === "undefined") {
                throw new Error("invalid fs.Stats property: " + key);
            }
            stats[key] = val;
            return this.set("stats", stats);
        };
        FileStub.prototype.make = function() {
            var name = this.get("name");
            fileStubMap[name] = this;
            var stubMany = sandbox.stubMany;
            fsStub.exists.withArgs(name).yields(true);
            fsStub.existsSync.withArgs(name).returns(true);
            var stats = this.get("stats");
            var statsObj = new fsStub.Stats();
            each(stats, function(key) {
                statsObj[key] = stats[key];
            });
            var readdir = this.get("readdir");
            var isDir = is.array(readdir);
            log("%s with %s children", name, readdir ? JSON.stringify(readdir) : "no");
            stubMany(statsObj, "isDirectory").isDirectory.returns(isDir);
            stubMany(statsObj, "isFile").isFile.returns(!isDir);
            fsStub.stat.withArgs(name).yields(null, statsObj);
            fsStub.statSync.withArgs(name).returns(statsObj);
        };
        FileStub.prototype.unlink = function() {
            var name = this.get("name");
            log("name: %s", name);
            var parentName = this.get("parentName");
            var relPath = name.replace(parentName + "/", "");
            var parentStub = fileStubMap[parentName];
            if (parentStub) {
                var parentReaddir = parentStub.get("readdir");
                log("removing %s from parent readdir", relPath);
                parentReaddir.splice(parentReaddir.indexOf(relPath), 1);
                parentStub.readdir(parentReaddir);
            }
            fsStub.exists.withArgs(name).yields(false);
            fsStub.existsSync.withArgs(name).returns(false);
            var err = new Error("ENOENT, no such file or directory '" + name + "'");
            fsStub.stat.withArgs(name).throws(err);
            fsStub.statSync.withArgs(name).throws(err);
            fsStub.readdir.withArgs(name).throws(err);
            fsStub.readdirSync.withArgs(name).throws(err);
            delete fileStubMap[name];
            var readdir = this.get("readdir");
            if (readdir) {
                readdir.forEach(function(relPath) {
                    var childName = name + "/" + relPath;
                    var childStub = fileStubMap[childName];
                    if (childStub) {
                        log("unlinked child %s", relPath);
                        fileStubMap[childName].unlink();
                    } else {
                        log("no stub for child %s", relPath);
                    }
                });
            }
        };
        var globalInjector = {
            mocha: function() {
                beforeEach(function(hookDone) {
                    sinonDoublistFs(this);
                    hookDone();
                });
                afterEach(function(hookDone) {
                    this.restoreFs();
                    hookDone();
                });
            }
        };
        function intermediatePaths(sparse) {
            var dense = {};
            var trimSlashRe = /(^\/|\/+$)/;
            sparse.forEach(function(path) {
                dense[path] = {};
                var curParts = path.replace(trimSlashRe, "").split("/");
                var gapParts = [];
                curParts.forEach(function(part) {
                    var parent = "/" + gapParts.join("/");
                    gapParts.push(part);
                    var intermediate = "/" + gapParts.join("/");
                    if (!dense[intermediate]) {
                        dense[intermediate] = {};
                    }
                    if (!dense[parent]) {
                        dense[parent] = {};
                    }
                    if ("/" === parent) {
                        dense[parent][intermediate.slice(1)] = 1;
                    } else {
                        dense[parent][intermediate.replace(parent + "/", "")] = 1;
                    }
                });
            });
            each(dense, function(path, children) {
                dense[path] = Object.keys(children);
            });
            return dense;
        }
        function addInternalProp(obj, name, val) {
            Object.defineProperty(obj, "__sinonDoublistFs__" + name, {
                value: val,
                enumerable: false,
                configurable: false,
                writable: true
            });
        }
        function getInternalProp(obj, name) {
            return obj["__sinonDoublistFs__" + name];
        }
    });
    require.alias("codeactual-is/index.js", "sinon-doublist-fs/deps/is/index.js");
    require.alias("manuelstofer-each/index.js", "codeactual-is/deps/each/index.js");
    require.alias("codeactual-sinon-doublist/index.js", "sinon-doublist-fs/deps/sinon-doublist/index.js");
    require.alias("codeactual-is/index.js", "codeactual-sinon-doublist/deps/is/index.js");
    require.alias("manuelstofer-each/index.js", "codeactual-is/deps/each/index.js");
    require.alias("component-bind/index.js", "codeactual-sinon-doublist/deps/bind/index.js");
    require.alias("logicalparadox-goodwin/lib/goodwin.js", "codeactual-sinon-doublist/deps/goodwin/lib/goodwin.js");
    require.alias("logicalparadox-goodwin/lib/goodwin.js", "codeactual-sinon-doublist/deps/goodwin/index.js");
    require.alias("logicalparadox-goodwin/lib/goodwin.js", "logicalparadox-goodwin/index.js");
    require.alias("component-bind/index.js", "sinon-doublist-fs/deps/bind/index.js");
    require.alias("visionmedia-configurable.js/index.js", "sinon-doublist-fs/deps/configurable.js/index.js");
    require.alias("component-clone/index.js", "sinon-doublist-fs/deps/clone/index.js");
    require.alias("component-type/index.js", "component-clone/deps/type/index.js");
    require.alias("component-each/index.js", "sinon-doublist-fs/deps/each/index.js");
    require.alias("component-type/index.js", "component-each/deps/type/index.js");
    require.alias("sinon-doublist-fs/lib/sinon-doublist-fs/index.js", "sinon-doublist-fs/index.js");
    if (typeof exports == "object") {
        module.exports = require("sinon-doublist-fs");
    } else if (typeof define == "function" && define.amd) {
        define(function() {
            return require("sinon-doublist-fs");
        });
    } else {
        window["sinonDoublistFs"] = require("sinon-doublist-fs");
    }
})();