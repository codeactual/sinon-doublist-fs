module.exports = function(grunt) {
  'use strict';

  var config = {
    test_lib: { // Rather than default `test/lib` path
      command: 'mocha --harmony --colors --recursive --reporter spec test/lib/sinon-doublist-fs'
    }
  };

  if (this.learn('initConfig.harmony')) {
    config.test_co_fs = {
      options: this.learn('initConfig.shell.test_lib.options'),
      command: 'mocha --harmony --colors --recursive --reporter spec test/lib/co-fs.js'
    };
  }

  return config;
};
