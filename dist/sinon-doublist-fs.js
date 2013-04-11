;(function(){

/**
 * Require the given path.
 *
 * @param {String} path
 * @return {Object} exports
 * @api public
 */

function require(path, parent, orig) {
  var resolved = require.resolve(path);

  // lookup failed
  if (null == resolved) {
    orig = orig || path;
    parent = parent || 'root';
    var err = new Error('Failed to require "' + orig + '" from "' + parent + '"');
    err.path = orig;
    err.parent = parent;
    err.require = true;
    throw err;
  }

  var module = require.modules[resolved];

  // perform real require()
  // by invoking the module's
  // registered function
  if (!module.exports) {
    module.exports = {};
    module.client = module.component = true;
    module.call(this, module.exports, require.relative(resolved), module);
  }

  return module.exports;
}

/**
 * Registered modules.
 */

require.modules = {};

/**
 * Registered aliases.
 */

require.aliases = {};

/**
 * Resolve `path`.
 *
 * Lookup:
 *
 *   - PATH/index.js
 *   - PATH.js
 *   - PATH
 *
 * @param {String} path
 * @return {String} path or null
 * @api private
 */

require.resolve = function(path) {
  if (path.charAt(0) === '/') path = path.slice(1);
  var index = path + '/index.js';

  var paths = [
    path,
    path + '.js',
    path + '.json',
    path + '/index.js',
    path + '/index.json'
  ];

  for (var i = 0; i < paths.length; i++) {
    var path = paths[i];
    if (require.modules.hasOwnProperty(path)) return path;
  }

  if (require.aliases.hasOwnProperty(index)) {
    return require.aliases[index];
  }
};

/**
 * Normalize `path` relative to the current path.
 *
 * @param {String} curr
 * @param {String} path
 * @return {String}
 * @api private
 */

require.normalize = function(curr, path) {
  var segs = [];

  if ('.' != path.charAt(0)) return path;

  curr = curr.split('/');
  path = path.split('/');

  for (var i = 0; i < path.length; ++i) {
    if ('..' == path[i]) {
      curr.pop();
    } else if ('.' != path[i] && '' != path[i]) {
      segs.push(path[i]);
    }
  }

  return curr.concat(segs).join('/');
};

/**
 * Register module at `path` with callback `definition`.
 *
 * @param {String} path
 * @param {Function} definition
 * @api private
 */

require.register = function(path, definition) {
  require.modules[path] = definition;
};

/**
 * Alias a module definition.
 *
 * @param {String} from
 * @param {String} to
 * @api private
 */

require.alias = function(from, to) {
  if (!require.modules.hasOwnProperty(from)) {
    throw new Error('Failed to alias "' + from + '", it does not exist');
  }
  require.aliases[to] = from;
};

/**
 * Return a require function relative to the `parent` path.
 *
 * @param {String} parent
 * @return {Function}
 * @api private
 */

require.relative = function(parent) {
  var p = require.normalize(parent, '..');

  /**
   * lastIndexOf helper.
   */

  function lastIndexOf(arr, obj) {
    var i = arr.length;
    while (i--) {
      if (arr[i] === obj) return i;
    }
    return -1;
  }

  /**
   * The relative require() itself.
   */

  function localRequire(path) {
    var resolved = localRequire.resolve(path);
    return require(resolved, parent, path);
  }

  /**
   * Resolve relative to the parent.
   */

  localRequire.resolve = function(path) {
    var c = path.charAt(0);
    if ('/' == c) return path.slice(1);
    if ('.' == c) return require.normalize(p, path);

    // resolve deps by returning
    // the dep in the nearest "deps"
    // directory
    var segs = parent.split('/');
    var i = lastIndexOf(segs, 'deps') + 1;
    if (!i) i = 0;
    path = segs.slice(0, i + 1).join('/') + '/deps/' + path;
    return path;
  };

  /**
   * Check if module is defined at `path`.
   */

  localRequire.exists = function(path) {
    return require.modules.hasOwnProperty(localRequire.resolve(path));
  };

  return localRequire;
};
require.register("manuelstofer-each/index.js", Function("exports, require, module",
"\"use strict\";\n\nvar nativeForEach = [].forEach;\n\n// Underscore's each function\nmodule.exports = function (obj, iterator, context) {\n    if (obj == null) return;\n    if (nativeForEach && obj.forEach === nativeForEach) {\n        obj.forEach(iterator, context);\n    } else if (obj.length === +obj.length) {\n        for (var i = 0, l = obj.length; i < l; i++) {\n            if (iterator.call(context, obj[i], i, obj) === {}) return;\n        }\n    } else {\n        for (var key in obj) {\n            if (Object.prototype.hasOwnProperty.call(obj, key)) {\n                if (iterator.call(context, obj[key], key, obj) === {}) return;\n            }\n        }\n    }\n};\n//@ sourceURL=manuelstofer-each/index.js"
));
require.register("codeactual-is/index.js", Function("exports, require, module",
"/*jshint node:true*/\n\"use strict\";\n\nvar each = require('each');\nvar types = ['Arguments', 'Function', 'String', 'Number', 'Date', 'RegExp', 'Array'];\n\neach(types, function (type) {\n  var method = type === 'Function' ? type : type.toLowerCase();\n  module.exports[method] = function (obj) {\n    return Object.prototype.toString.call(obj) === '[object ' + type + ']';\n  };\n});\n\nif (Array.isArray) {\n  module.exports.array = Array.isArray;\n}\n\nmodule.exports.object = function (obj) {\n  return obj === Object(obj);\n};\n\n//@ sourceURL=codeactual-is/index.js"
));
require.register("logicalparadox-goodwin/lib/goodwin.js", Function("exports, require, module",
"/*!\n * goodwin - deep object get/set path values\n * Copyright(c) 2012 Jake Luer <jake@alogicalparadox.com>\n * MIT Licensed\n *\n * @website https://github.com/logicalparadox/goodwin/'\n * @issues https://github.com/logicalparadox/goodwin/issues'\n */\n\n/*!\n * Primary exports\n */\n\nvar exports = module.exports = {};\n\n/*!\n * Module version\n */\n\nexports.version = '1.1.0';\n\n/**\n * ### .getPathValue(path, object)\n *\n * Retrieve the value in an object given a string path.\n *\n * ```js\n * var obj = {\n *     prop1: {\n *         arr: ['a', 'b', 'c']\n *       , str: 'Hello'\n *     }\n *   , prop2: {\n *         arr: [ { nested: 'Universe' } ]\n *       , str: 'Hello again!'\n *     }\n * };\n * ```\n *\n * The following would be the results.\n *\n * ```js\n * goodwin.getPathValue('prop1.str', obj); // Hello\n * goodwin.getPathValue('prop1.att[2]', obj); // b\n * goodwin.getPathValue('prop2.arr[0].nested', obj); // Universe\n * ```\n *\n * @param {String} path\n * @param {Object} object\n * @returns {Object} value or `undefined`\n */\n\nexports.getPathValue = function (path, obj) {\n  var parsed = parsePath(path);\n  return getPathValue(parsed, obj);\n};\n\n/**\n * ### .setPathValue(path, value, object)\n *\n * Defining the value in an object at a given string path.\n *\n * ```js\n * var obj = {\n *     prop1: {\n *         arr: ['a', 'b', 'c']\n *       , str: 'Hello'\n *     }\n *   , prop2: {\n *         arr: [ { nested: 'Universe' } ]\n *       , str: 'Hello again!'\n *     }\n * };\n * ```\n *\n * The following would be acceptable.\n *\n * ```js\n * goodwin.setPathValue('prop1.str', 'Hello Universe!', obj);\n * goodwin.setPathValue('prop1.arr[2]', 'B', obj);\n * goodwin.setPathValue('prop2.arr[0].nested.value', { hello: 'universe' }, obj);\n * ```\n *\n * @param {String} path\n * @param {Mixed} value\n * @param {Object} object\n * @api public\n */\n\nexports.setPathValue = function (path, val, obj) {\n  var parsed = parsePath(path);\n  setPathValue(parsed, val, obj);\n};\n\nfunction defined (val) {\n  return 'undefined' === typeof val;\n}\n\n/*!\n * Helper function used to parse string object\n * paths. Use in conjunction with `getPathValue`.\n *\n *  var parsed = parsePath('myobject.property.subprop');\n *\n * ### Paths:\n *\n * * Can be as near infinitely deep and nested\n * * Arrays are also valid using the formal `myobject.document[3].property`.\n *\n * @param {String} path\n * @returns {Object} parsed\n */\n\nfunction parsePath (path) {\n  var str = path.replace(/\\[/g, '.[')\n    , parts = str.match(/(\\\\\\.|[^.]+?)+/g);\n\n  return parts.map(function (value) {\n    var re = /\\[(\\d+)\\]$/\n      , mArr = re.exec(value)\n    if (mArr) return { i: parseFloat(mArr[1]) };\n    else return { p: value };\n  });\n};\n\n/*!\n * Companion function for `parsePath` that returns\n * the value located at the parsed address.\n *\n *  var value = getPathValue(parsed, obj);\n *\n * @param {Object} parsed definition from `parsePath`.\n * @param {Object} object to search against\n * @returns {Object|Undefined} value\n */\n\nfunction getPathValue (parsed, obj) {\n  var tmp = obj\n    , res;\n\n  for (var i = 0, l = parsed.length; i < l; i++) {\n    var part = parsed[i];\n    if (tmp) {\n      if (!defined(part.p)) tmp = tmp[part.p];\n      else if (!defined(part.i)) tmp = tmp[part.i];\n      if (i == (l - 1)) res = tmp;\n    } else {\n      res = undefined;\n    }\n  }\n\n  return res;\n};\n\n/*!\n * Companion function for `parsePath` that sets\n * the value located at a parsed address.\n *\n *  setPathValue(parsed, 'value', obj);\n *\n * @param {Object} parsed definition from `parsePath`\n * @param {*} value to use upon set\n * @param {Object} object to search and define on\n * @api private\n */\n\nfunction setPathValue (parsed, val, obj) {\n  var tmp = obj;\n\n  for (var i = 0, l = parsed.length; i < l; i++) {\n    var part = parsed[i];\n    if (!defined(tmp)) {\n      if (i == (l - 1)) {\n        if (!defined(part.p)) tmp[part.p] = val;\n        else if (!defined(part.i)) tmp[part.i] = val;\n      } else {\n        if (!defined(part.p) && tmp[part.p]) tmp = tmp[part.p];\n        else if (!defined(part.i) && tmp[part.i]) tmp = tmp[part.i];\n        else {\n          var next = parsed[i + 1];\n          if (!defined(part.p)) {\n            tmp[part.p] = {};\n            tmp = tmp[part.p];\n          } else if (!defined(part.i)) {\n            tmp[part.i] = [];\n            tmp = tmp[part.i]\n          }\n        }\n      }\n    } else {\n      if (i == (l - 1)) tmp = val;\n      else if (!defined(part.p)) tmp = {};\n      else if (!defined(part.i)) tmp = [];\n    }\n  }\n};\n//@ sourceURL=logicalparadox-goodwin/lib/goodwin.js"
));
require.register("codeactual-sinon-doublist/index.js", Function("exports, require, module",
"/**\n * Sinon.JS test double mixins.\n *\n * Licensed under MIT.\n * Copyright (c) 2013 David Smith <https://github.com/codeactual/>\n */\n\n/*jshint node:true*/\n'use strict';\n\nvar sinonDoublist = module.exports = function(sinon, test, disableAutoSandbox) {\n  if (typeof test === 'string') {\n    globalInjector[test](sinon, disableAutoSandbox);\n    return;\n  }\n\n  Object.keys(mixin).forEach(function(method) {\n    test[method] = bind(test, mixin[method]);\n  });\n  if (!disableAutoSandbox) {\n    test._createSandbox(sinon);\n  }\n};\n\nvar is = require('is');\nvar bind = require('bind');\nvar goodwin = require('goodwin');\nvar setPathValue = goodwin.setPathValue;\nvar getPathValue = goodwin.getPathValue;\nvar mixin = {};\nvar browserEnv = typeof window === 'object';\n\nmixin._createSandbox = function(sinon) {\n  var self = this;\n  this.sandbox = sinon.sandbox.create();\n  this.spy = bind(self.sandbox, this.sandbox.spy);\n  this.stub = bind(self.sandbox, this.sandbox.stub);\n  this.mock = bind(self.sandbox, this.sandbox.mock);\n  this.clock = this.sandbox.useFakeTimers();\n  this.server = this.sandbox.useFakeServer();\n  if (browserEnv) {\n    this.requests = this.server.requests;\n  }\n};\n\nmixin.restoreSandbox = function() {\n  this.sandbox.restore();\n};\n\n/**\n * _doubleMany() wrapper configured for 'spy' type.\n *\n * @param {object} obj Double target object.\n * @param {string|array} methods One or more method names/namespaces.\n *   They do not have to exist, e.g. 'obj' and be {} for convenience.\n * @return {object} Stub(s) indexed by method name.\n */\nmixin.spyMany = function(obj, methods) {\n  // Use call() to propagate the context bound in beforeEach().\n  return mixin._doubleMany.call(this, 'spy', obj, methods);\n};\n\n/**\n * _doubleMany() wrapper configured for 'stub' type.\n *\n * @param {object} obj Double target object.\n * @param {string|array} methods One or more method names/namespaces.\n *   They do not have to exist, e.g. 'obj' and be {} for convenience.\n * @return {object} Stub(s) indexed by method name.\n */\nmixin.stubMany = function(obj, methods) {\n  // Use call() to propagate the context bound in beforeEach().\n  return mixin._doubleMany.call(this, 'stub', obj, methods);\n};\n\n/**\n * withArgs()/returns() convenience wrapper.\n *\n * Example use case: SUT is that lib function foo() calls bar()\n * with expected arguments. But one of the arguments to bar()\n * is the return value of baz(). Use this helper to stub baz()\n * out of the picture, to focus on the foo() and bar() relationship.\n *\n * A baz() example is _.bind().\n *\n * @param {object} config\n *   Required:\n *\n *   {string} method` Stub target method name, ex. 'bind'\n *\n *   Optional:\n *\n *   {object} obj Stub target object, ex. underscore.\n *   {array} args Arguments 'method' expects to receive.\n *   {string|array} spies Stub will return an object with spies given these names.\n *     An alternative to setting an explicit returns.\n *   {mixed} returns Stub returns this value.\n *     An alternative to setting  spies.\n * @return {object}\n *   {function} returnedSpy or {object} returnedSpies Depends on whether spies is a string or array.\n *   {function} <method> The created stub. The property name will match the configured method name.\n *   {object} target Input obj, or {} if 'obj' was null.\n * @throws Error If method not specified.\n */\nmixin.stubWithReturn = function(config) {\n  config = config || {};\n\n  var self = this;\n  var stub;\n  var returns;\n  var isReturnsConfigured = config.hasOwnProperty('returns');\n  var payload = {};\n\n  if (!is.string(config.method) || !config.method.length) {\n    throw new Error('method not specified');\n  }\n\n  // Allow test to avoid creating the config.obj ahead of time.\n  if (config.obj) {\n    stub = this.stub(config.obj, config.method);\n  } else {\n    config.obj = {};\n    stub = this.stubMany(config.obj, config.method)[config.method];\n  }\n\n  // Detect the need for withArgs().\n  if (is.array(config.args) && config.args.length) {\n    stub = stub.withArgs.apply(stub, config.args);\n  }\n\n  // Create the stub return value. Either a spy itself or hash of them.\n  if (config.spies) {\n    returns = {};\n\n    // 'a.b.c.spy1'\n    if (is.string(config.spies) && /\\./.test(config.spies)) {\n      setPathValue(config.spies, this.spy(), returns);\n    } else {\n      var spies = [].concat(config.spies);\n      for (var s = 0; s < spies.length; s++) {\n        returns[spies[s]] = self.spy();\n      }\n    }\n  } else {\n    if (isReturnsConfigured) {\n      returns = config.returns;\n    } else {\n      returns = this.spy();\n    }\n  }\n  stub.returns(returns);\n\n  if (!isReturnsConfigured) {\n    if (is.Function(returns)) {\n      payload.returnedSpy = returns;\n    } else {\n      payload.returnedSpies = returns;\n    }\n  }\n  payload[config.method] = stub;\n  payload.target = config.obj;\n\n  return payload;\n};\n\n/**\n * Spy/stub one or more methods of an object.\n *\n * @param {string} type 'spy' or 'stub'\n * @param {object} obj Double target object.\n * @param {string|array} methods One or more method names/namespaces.\n *   They do not have to exist, e.g. 'obj' and be {} for convenience.\n * @return {object} Stub(s) indexed by method name.\n */\nmixin._doubleMany = function(type, obj, methods) {\n  var self = this;\n  var doubles = {};\n  methods = [].concat(methods);\n\n  for (var m = 0; m < methods.length; m++) {\n    var method = methods[m];\n\n    // Sinon requires doubling target to exist.\n    if (!getPathValue(method, obj)) {\n      setPathValue(method, sinonDoublistNoOp, obj);\n    }\n\n    if (/\\./.test(method)) { // Ex. 'a.b.c'\n      var lastNsPart = method.split('.').slice(-1);  // Ex. 'c'\n      doubles[method] = self[type](\n        getPathValue(method.split('.').slice(0, -1).join('.'), obj), // Ex. 'a.b'\n        method.split('.').slice(-1)  // Ex. 'c'\n      );\n    } else {\n      doubles[method] = self[type](obj, method);\n    }\n  }\n\n  return doubles;\n};\n\nvar globalInjector = {\n  mocha: function(sinon, disableAutoSandbox) {\n    beforeEach(function(done) {\n      sinonDoublist(sinon, this, disableAutoSandbox);\n      done();\n    });\n\n    afterEach(function(done) {\n      this.sandbox.restore();\n      done();\n    });\n  }\n};\n\nfunction sinonDoublistNoOp() {}\n//@ sourceURL=codeactual-sinon-doublist/index.js"
));
require.register("component-bind/index.js", Function("exports, require, module",
"\n/**\n * Slice reference.\n */\n\nvar slice = [].slice;\n\n/**\n * Bind `obj` to `fn`.\n *\n * @param {Object} obj\n * @param {Function|String} fn or string\n * @return {Function}\n * @api public\n */\n\nmodule.exports = function(obj, fn){\n  if ('string' == typeof fn) fn = obj[fn];\n  if ('function' != typeof fn) throw new Error('bind() requires a function');\n  var args = [].slice.call(arguments, 2);\n  return function(){\n    return fn.apply(obj, args.concat(slice.call(arguments)));\n  }\n};\n//@ sourceURL=component-bind/index.js"
));
require.register("visionmedia-configurable.js/index.js", Function("exports, require, module",
"\n/**\n * Make `obj` configurable.\n *\n * @param {Object} obj\n * @return {Object} the `obj`\n * @api public\n */\n\nmodule.exports = function(obj){\n\n  /**\n   * Mixin settings.\n   */\n\n  obj.settings = {};\n\n  /**\n   * Set config `name` to `val`, or\n   * multiple with an object.\n   *\n   * @param {String|Object} name\n   * @param {Mixed} val\n   * @return {Object} self\n   * @api public\n   */\n\n  obj.set = function(name, val){\n    if (1 == arguments.length) {\n      for (var key in name) {\n        this.set(key, name[key]);\n      }\n    } else {\n      this.settings[name] = val;\n    }\n\n    return this;\n  };\n\n  /**\n   * Get setting `name`.\n   *\n   * @param {String} name\n   * @return {Mixed}\n   * @api public\n   */\n\n  obj.get = function(name){\n    return this.settings[name];\n  };\n\n  /**\n   * Enable `name`.\n   *\n   * @param {String} name\n   * @return {Object} self\n   * @api public\n   */\n\n  obj.enable = function(name){\n    return this.set(name, true);\n  };\n\n  /**\n   * Disable `name`.\n   *\n   * @param {String} name\n   * @return {Object} self\n   * @api public\n   */\n\n  obj.disable = function(name){\n    return this.set(name, false);\n  };\n\n  /**\n   * Check if `name` is enabled.\n   *\n   * @param {String} name\n   * @return {Boolean}\n   * @api public\n   */\n\n  obj.enabled = function(name){\n    return !! this.get(name);\n  };\n\n  /**\n   * Check if `name` is disabled.\n   *\n   * @param {String} name\n   * @return {Boolean}\n   * @api public\n   */\n\n  obj.disabled = function(name){\n    return ! this.get(name);\n  };\n\n  return obj;\n};//@ sourceURL=visionmedia-configurable.js/index.js"
));
require.register("component-type/index.js", Function("exports, require, module",
"\n/**\n * toString ref.\n */\n\nvar toString = Object.prototype.toString;\n\n/**\n * Return the type of `val`.\n *\n * @param {Mixed} val\n * @return {String}\n * @api public\n */\n\nmodule.exports = function(val){\n  switch (toString.call(val)) {\n    case '[object Function]': return 'function';\n    case '[object Date]': return 'date';\n    case '[object RegExp]': return 'regexp';\n    case '[object Arguments]': return 'arguments';\n    case '[object Array]': return 'array';\n    case '[object String]': return 'string';\n  }\n\n  if (val === null) return 'null';\n  if (val === undefined) return 'undefined';\n  if (val && val.nodeType === 1) return 'element';\n  if (val === Object(val)) return 'object';\n\n  return typeof val;\n};\n//@ sourceURL=component-type/index.js"
));
require.register("component-clone/index.js", Function("exports, require, module",
"\n/**\n * Module dependencies.\n */\n\nvar type;\n\ntry {\n  type = require('type');\n} catch(e){\n  type = require('type-component');\n}\n\n/**\n * Module exports.\n */\n\nmodule.exports = clone;\n\n/**\n * Clones objects.\n *\n * @param {Mixed} any object\n * @api public\n */\n\nfunction clone(obj){\n  switch (type(obj)) {\n    case 'object':\n      var copy = {};\n      for (var key in obj) {\n        if (obj.hasOwnProperty(key)) {\n          copy[key] = clone(obj[key]);\n        }\n      }\n      return copy;\n\n    case 'array':\n      var copy = new Array(obj.length);\n      for (var i = 0, l = obj.length; i < l; i++) {\n        copy[i] = clone(obj[i]);\n      }\n      return copy;\n\n    case 'regexp':\n      // from millermedeiros/amd-utils - MIT\n      var flags = '';\n      flags += obj.multiline ? 'm' : '';\n      flags += obj.global ? 'g' : '';\n      flags += obj.ignoreCase ? 'i' : '';\n      return new RegExp(obj.source, flags);\n\n    case 'date':\n      return new Date(obj.getTime());\n\n    default: // string, number, boolean, …\n      return obj;\n  }\n}\n//@ sourceURL=component-clone/index.js"
));
require.register("component-indexof/index.js", Function("exports, require, module",
"\nvar indexOf = [].indexOf;\n\nmodule.exports = function(arr, obj){\n  if (indexOf) return arr.indexOf(obj);\n  for (var i = 0; i < arr.length; ++i) {\n    if (arr[i] === obj) return i;\n  }\n  return -1;\n};//@ sourceURL=component-indexof/index.js"
));
require.register("component-emitter/index.js", Function("exports, require, module",
"\n/**\n * Module dependencies.\n */\n\nvar index = require('indexof');\n\n/**\n * Expose `Emitter`.\n */\n\nmodule.exports = Emitter;\n\n/**\n * Initialize a new `Emitter`.\n *\n * @api public\n */\n\nfunction Emitter(obj) {\n  if (obj) return mixin(obj);\n};\n\n/**\n * Mixin the emitter properties.\n *\n * @param {Object} obj\n * @return {Object}\n * @api private\n */\n\nfunction mixin(obj) {\n  for (var key in Emitter.prototype) {\n    obj[key] = Emitter.prototype[key];\n  }\n  return obj;\n}\n\n/**\n * Listen on the given `event` with `fn`.\n *\n * @param {String} event\n * @param {Function} fn\n * @return {Emitter}\n * @api public\n */\n\nEmitter.prototype.on = function(event, fn){\n  this._callbacks = this._callbacks || {};\n  (this._callbacks[event] = this._callbacks[event] || [])\n    .push(fn);\n  return this;\n};\n\n/**\n * Adds an `event` listener that will be invoked a single\n * time then automatically removed.\n *\n * @param {String} event\n * @param {Function} fn\n * @return {Emitter}\n * @api public\n */\n\nEmitter.prototype.once = function(event, fn){\n  var self = this;\n  this._callbacks = this._callbacks || {};\n\n  function on() {\n    self.off(event, on);\n    fn.apply(this, arguments);\n  }\n\n  fn._off = on;\n  this.on(event, on);\n  return this;\n};\n\n/**\n * Remove the given callback for `event` or all\n * registered callbacks.\n *\n * @param {String} event\n * @param {Function} fn\n * @return {Emitter}\n * @api public\n */\n\nEmitter.prototype.off =\nEmitter.prototype.removeListener =\nEmitter.prototype.removeAllListeners = function(event, fn){\n  this._callbacks = this._callbacks || {};\n\n  // all\n  if (0 == arguments.length) {\n    this._callbacks = {};\n    return this;\n  }\n\n  // specific event\n  var callbacks = this._callbacks[event];\n  if (!callbacks) return this;\n\n  // remove all handlers\n  if (1 == arguments.length) {\n    delete this._callbacks[event];\n    return this;\n  }\n\n  // remove specific handler\n  var i = index(callbacks, fn._off || fn);\n  if (~i) callbacks.splice(i, 1);\n  return this;\n};\n\n/**\n * Emit `event` with the given args.\n *\n * @param {String} event\n * @param {Mixed} ...\n * @return {Emitter}\n */\n\nEmitter.prototype.emit = function(event){\n  this._callbacks = this._callbacks || {};\n  var args = [].slice.call(arguments, 1)\n    , callbacks = this._callbacks[event];\n\n  if (callbacks) {\n    callbacks = callbacks.slice(0);\n    for (var i = 0, len = callbacks.length; i < len; ++i) {\n      callbacks[i].apply(this, args);\n    }\n  }\n\n  return this;\n};\n\n/**\n * Return array of callbacks for `event`.\n *\n * @param {String} event\n * @return {Array}\n * @api public\n */\n\nEmitter.prototype.listeners = function(event){\n  this._callbacks = this._callbacks || {};\n  return this._callbacks[event] || [];\n};\n\n/**\n * Check if this emitter has `event` handlers.\n *\n * @param {String} event\n * @return {Boolean}\n * @api public\n */\n\nEmitter.prototype.hasListeners = function(event){\n  return !! this.listeners(event).length;\n};\n//@ sourceURL=component-emitter/index.js"
));
require.register("visionmedia-batch/index.js", Function("exports, require, module",
"\n/**\n * Module dependencies.\n */\n\ntry {\n  var EventEmitter = require('events').EventEmitter;\n} catch (err) {\n  var Emitter = require('emitter');\n}\n\n/**\n * Noop.\n */\n\nfunction noop(){}\n\n/**\n * Expose `Batch`.\n */\n\nmodule.exports = Batch;\n\n/**\n * Create a new Batch.\n */\n\nfunction Batch() {\n  this.fns = [];\n  this.concurrency(Infinity);\n  for (var i = 0, len = arguments.length; i < len; ++i) {\n    this.push(arguments[i]);\n  }\n}\n\n/**\n * Inherit from `EventEmitter.prototype`.\n */\n\nif (EventEmitter) {\n  Batch.prototype.__proto__ = EventEmitter.prototype;\n} else {\n  Emitter(Batch.prototype);\n}\n\n/**\n * Set concurrency to `n`.\n *\n * @param {Number} n\n * @return {Batch}\n * @api public\n */\n\nBatch.prototype.concurrency = function(n){\n  this.n = n;\n  return this;\n};\n\n/**\n * Queue a function.\n *\n * @param {Function} fn\n * @return {Batch}\n * @api public\n */\n\nBatch.prototype.push = function(fn){\n  this.fns.push(fn);\n  return this;\n};\n\n/**\n * Execute all queued functions in parallel,\n * executing `cb(err, results)`.\n *\n * @param {Function} cb\n * @return {Batch}\n * @api public\n */\n\nBatch.prototype.end = function(cb){\n  var self = this\n    , total = this.fns.length\n    , pending = total\n    , results = []\n    , cb = cb || noop\n    , fns = this.fns\n    , max = this.n\n    , index = 0\n    , done;\n\n  // empty\n  if (!fns.length) return cb(null, results);\n\n  // process\n  function next() {\n    var i = index++;\n    var fn = fns[i];\n    if (!fn) return;\n    var start = new Date;\n    fn(function(err, res){\n      if (done) return;\n      if (err) return done = true, cb(err);\n      var complete = total - pending + 1;\n      var end = new Date;\n\n      results[i] = res;\n\n      self.emit('progress', {\n        index: i,\n        value: res,\n        pending: pending,\n        total: total,\n        complete: complete,\n        percent: complete / total * 100 | 0,\n        start: start,\n        end: end,\n        duration: end - start\n      });\n\n      if (--pending) next()\n      else cb(null, results);\n    });\n  }\n\n  // concurrency\n  for (var i = 0; i < fns.length; i++) {\n    if (i == max) break;\n    next();\n  }\n\n  return this;\n};\n//@ sourceURL=visionmedia-batch/index.js"
));
require.register("sinon-doublist-fs/index.js", Function("exports, require, module",
"/**\n * node.js `fs` stubbing mixin for sinon-doublist.\n *\n * Licensed under MIT.\n * Copyright (c) 2013 David Smith <https://github.com/codeactual/>\n */\n\n/*jshint node:true*/\n/*global beforeEach:false, afterEach:false*/\n'use strict';\n\n/**\n * @param {object} fs Pre-loaded module.\n * @param {string|object} test Test context (with sinonDoublist sandbox),\n *   or the name of a supported runner to globally configure.\n *   Supported: 'mocha'\n */\nvar sinonDoublistFs = module.exports = function(fs, test) {\n  if (is.string(test)) {\n    globalInjector[test](fs);\n    return;\n  }\n\n  if (is.Function(fs.exists.restore)) { // Already doubled.\n    return;\n  }\n\n  Object.keys(mixin).forEach(function(method) { // stubFile(), etc.\n    test[method] = bind(test, mixin[method]);\n  });\n\n  fileStubMap = {};\n\n  test.fsStub = test.stub(fs);\n\n  // Regain access to original constructor for `fs.stat*` stubbing.\n  test.fsStub.Stats.restore();\n\n  // Force all existence checks to fail by default.\n  test.fsStub.exists.callsArgWith(1, false);\n  test.fsStub.existsSync.returns(false);\n\n  // Replace initial full-object stubs with some custom ones.\n  Object.keys(customFsStub).forEach(function(method) {\n    test.fsStub[method].restore();\n    test.fsStub[method] = test.stub(fs, method, customFsStub[method]);\n  });\n};\n\nsinonDoublistFs.require = require; // Give tests access to component loader.\n\nvar is = require('is');\nvar bind = require('bind');\nvar clone = require('clone');\nvar configurable = require('configurable.js');\nvar fileStubMap;\nvar mixin = {};\nvar customFsStub = {};\n\n/**\n * Begin configuring a file stub.\n *\n * @param {string} name File/directory name without trailing slash.\n * @return {object} this\n */\nmixin.stubFile = function(name) {\n  if (!is.string(name) || name.trim() === '') {\n    throw new Error('invalid stubFile() name: ' + JSON.stringify(name));\n  }\n\n  var fileStub = new FileStub(this.fsStub);\n  return fileStub.set('name', name).set('sandbox', this);\n};\n\n/**\n * Clean up resources not covered by sinonDoublist's sandbox restoration.\n */\nmixin.restoreFs = function() {\n  fileStubMap = null;\n};\n\n/**\n * Clone the file stub and remove the old one.\n *\n * @param {string} oldPath\n * @param {string} newPath\n */\ncustomFsStub.renameSync = function(oldPath, newPath) {\n  fileStubMap[newPath] = FileStub.clone(fileStubMap[oldPath]);\n  fileStubMap[newPath].set('name', newPath);\n  fileStubMap[newPath].make();\n\n  var parentdir = fileStubMap[newPath].get('parentdir');\n  var parentStub = fileStubMap[parentdir];\n  if (parentStub) {\n    var parentReaddir = parentStub.get('readdir');\n    var relPath = newPath.replace(parentdir + '/', '');\n    if (-1 === parentReaddir.indexOf(relPath)) {\n      parentReaddir.push(relPath);\n      parentStub.set('readdir', parentReaddir);\n      parentStub.make();\n    }\n  }\n\n  fileStubMap[oldPath].unlink();\n};\n\n/**\n * Capture passed buffers for later access by `fs.readFile*`.\n *\n * @param {string} filename\n * @param {string|object} data String or Buffer instance.\n * @param {function} cb\n */\ncustomFsStub.writeFile = function(filename, data, cb) {\n  var stub = fileStubMap[filename];\n  if (stub) {\n    stub.buffer(data);\n  }\n  cb(null);\n};\n\n/**\n * Capture passed buffers for later access by `fs.readFile*`.\n *\n * @param {string} filename\n * @param {string|object} data String or Buffer instance.\n */\ncustomFsStub.writeFileSync = function(filename, data) {\n  var stub = fileStubMap[filename];\n  if (stub) {\n    stub.buffer(data);\n  }\n};\n\n/**\n * An entry in the map of stubbed files.\n */\nfunction FileStub(fsStub) {\n  this.settings = {\n    name: '',\n    readdir: false, // Or array of paths.\n    parentdir: '',\n    fsStub: fsStub,\n    sandbox: {}, // sinonDoublist sandbox.\n    stats: { // From fs.Stats example in manual.\n      dev: 2114,\n      ino: 48064969,\n      mode: 33188,\n      nlink: 1,\n      uid: 85,\n      gid: 100,\n      rdev: 0,\n      size: 527,\n      blksize: 4096,\n      blocks: 8,\n      atime: 'Mon, 10 Oct 2011 23:24:11 GMT',\n      mtime: 'Mon, 10 Oct 2011 23:24:11 GMT',\n      ctime: 'Mon, 10 Oct 2011 23:24:11 GMT'\n    }\n  };\n}\n\nconfigurable(FileStub.prototype);\n\n/**\n * Create a new FileStub instance based on the settings of the source.\n *\n * @param {object} srcStub\n * @return {object}\n */\nFileStub.clone = function(srcStub) {\n  var dstStub = new FileStub(srcStub.get('fsStub'));\n  var simpleObjects = ['stats'];\n  Object.keys(srcStub.settings).forEach(function(key) {\n    if (-1 === simpleObjects.indexOf(key)) {\n      dstStub.settings[key] = srcStub.settings[key];\n    } else {\n      dstStub.settings[key] = clone(srcStub.settings[key]);\n    }\n  });\n  return dstStub;\n};\n\n/**\n * Set the buffer to be returned by `fs.readFile*`.\n *\n * @param {string|object} buffer String or Buffer instance.\n * @return this\n */\nFileStub.prototype.buffer = function(buffer) {\n  if (is.string(buffer)) {\n    buffer = new Buffer(buffer);\n  }\n  var fsStub = this.get('fsStub');\n  fsStub.readFileSync.withArgs(this.get('name')).returns(buffer);\n  fsStub.readFile.withArgs(this.get('name')).yields(null, buffer);\n  this.stat('size', buffer.length + 1);\n  return this;\n};\n\n/**\n * Set `fs.readdir*` results.\n *\n * @param {boolean|array} paths\n *   false: revert to default isFile=true\n *   array:\n *     path strings without trailing slash\n *     FileStub objects whose make() has not yet been called\n * @return this\n */\nFileStub.prototype.readdir = function(paths) {\n  var isArray = is.array(paths);\n  if (false !== paths && !isArray)  { // Avoid silent test misconfig.\n    throw new Error('invalid readdir config: ' + JSON.stringify(paths));\n  }\n\n  if (isArray && is.object(paths[0])) {\n    var relPaths = [];\n    var parentName = this.get('name');\n    paths.forEach(function(stub) {\n      relPaths.push(stub.get('name').replace(parentName + '/', ''));\n      stub.set('parentdir', parentName);\n      stub.make();\n    });\n    paths = relPaths;\n  }\n\n  return this.set('readdir', paths);\n};\n\n/**\n * Set an fs.Stats property.\n *\n * @param {string} key Ex. 'size' or 'gid'.\n * @param {mixed} val\n * @return this\n */\nFileStub.prototype.stat = function(key, val) {\n  var stats = this.get('stats');\n  if (typeof stats[key] === 'undefined') { // Avoid silent test misconfig.\n    throw new Error('invalid fs.Stats property: ' + key);\n  }\n  stats[key] = val;\n  return this.set('stats', stats);\n};\n\n/**\n * Finalize the `fs.{exists,stat,etc.}` stubs based on collected settings.\n */\nFileStub.prototype.make = function() {\n  var name = this.get('name');\n\n  fileStubMap[name] = this; // For later lookup in fake writeFile, etc.\n\n  var fsStub = this.get('fsStub');\n  var stubMany = this.get('sandbox').stubMany;\n\n  fsStub.exists.withArgs(name).yields(true);\n  fsStub.existsSync.withArgs(name).returns(true);\n\n  var stats = this.get('stats');\n  var statsObj = new fsStub.Stats();\n  Object.keys(stats).forEach(function(key) {\n    statsObj[key] = stats[key];\n  });\n\n  var paths = this.get('readdir');\n  var isDir = is.array(paths);\n\n  stubMany(statsObj, 'isDirectory').isDirectory.returns(isDir);\n  stubMany(statsObj, 'isFile').isFile.returns(!isDir);\n\n  fsStub.stat.withArgs(this.get('name')).yields(null, statsObj);\n  fsStub.statSync.withArgs(this.get('name')).returns(statsObj);\n\n  if (isDir) {\n    fsStub.readdir.withArgs(this.get('name')).yields(null, paths);\n    fsStub.readdirSync.withArgs(this.get('name')).returns(paths);\n  } else {\n    var err = new Error('ENOTDIR, not a directory ' + name);\n    fsStub.readdir.withArgs(this.get('name')).throws(err);\n    fsStub.readdirSync.withArgs(this.get('name')).throws(err);\n  }\n};\n\n/**\n * Undo make().\n */\nFileStub.prototype.unlink = function() {\n  var name = this.get('name');\n  var fsStub = this.get('fsStub');\n  var parentdir = this.get('parentdir');\n  var relPath = name.replace(parentdir + '/', '');\n\n  var parentStub = fileStubMap[parentdir];\n  if (parentStub) {\n    var parentReaddir = parentStub.get('readdir');\n    parentReaddir.splice(parentReaddir.indexOf(relPath), 1);\n    parentStub.set('readdir', parentReaddir);\n    parentStub.make();\n    fsStub.readdir.withArgs(parentdir).yields(null, parentReaddir);\n    fsStub.readdirSync.withArgs(parentdir).returns(parentReaddir);\n  }\n\n  fsStub.exists.withArgs(name).yields(false);\n  fsStub.existsSync.withArgs(name).returns(false);\n\n  var err = new Error('ENOENT, no such file or directory \\'' + name + '\\'');\n  fsStub.stat.withArgs(name).throws(err);\n  fsStub.statSync.withArgs(name).throws(err);\n  fsStub.readdir.withArgs(name).throws(err);\n  fsStub.readdirSync.withArgs(name).throws(err);\n\n  delete fileStubMap[name];\n};\n\nvar globalInjector = {\n  mocha: function(fs) {\n    beforeEach(function(hookDone) {\n      sinonDoublistFs(fs, this);\n      hookDone();\n    });\n\n    afterEach(function(hookDone) {\n      this.restoreFs();\n      hookDone();\n    });\n  }\n};\n//@ sourceURL=sinon-doublist-fs/index.js"
));
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

require.alias("visionmedia-batch/index.js", "sinon-doublist-fs/deps/batch/index.js");
require.alias("component-emitter/index.js", "visionmedia-batch/deps/emitter/index.js");
require.alias("component-indexof/index.js", "component-emitter/deps/indexof/index.js");

if (typeof exports == "object") {
  module.exports = require("sinon-doublist-fs");
} else if (typeof define == "function" && define.amd) {
  define(function(){ return require("sinon-doublist-fs"); });
} else {
  window["sinonDoublistFs"] = require("sinon-doublist-fs");
}})();