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
    require.register("sinon-doublist-fs/lib/component/main.js", function(exports, require, module) {
        module.exports = {
            requireComponent: require
        };
    });
    require.alias("codeactual-is/index.js", "sinon-doublist-fs/deps/is/index.js");
    require.alias("manuelstofer-each/index.js", "codeactual-is/deps/each/index.js");
    require.alias("component-bind/index.js", "sinon-doublist-fs/deps/bind/index.js");
    require.alias("visionmedia-configurable.js/index.js", "sinon-doublist-fs/deps/configurable.js/index.js");
    require.alias("component-clone/index.js", "sinon-doublist-fs/deps/clone/index.js");
    require.alias("component-type/index.js", "component-clone/deps/type/index.js");
    require.alias("component-each/index.js", "sinon-doublist-fs/deps/each/index.js");
    require.alias("component-type/index.js", "component-each/deps/type/index.js");
    require.alias("sinon-doublist-fs/lib/component/main.js", "sinon-doublist-fs/index.js");
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