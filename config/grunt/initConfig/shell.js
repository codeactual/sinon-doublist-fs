module.exports = function(grunt) {
  'use strict';

  return {
    test_lib: {
      command: 'mocha --harmony --colors --recursive --reporter spec test/lib/sinon-doublist-fs'
    },
    test_co_fs: {
      options: this.learn('initConfig.shell.test_lib.options'),
      command: 'mocha --harmony --colors --recursive --reporter spec test/lib/co-fs.js'
    }
  };
};
