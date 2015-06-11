module.exports = function exports() {
  'use strict';

  let config = {
    test_lib: { // Rather than default `test/lib` path
      command: 'mocha --harmony --colors --recursive --reporter spec test/lib/sinon-doublist-fs'
    }
  };

  config.test_co_fs = {
    options: this.learn('initConfig.shell.test_lib.options'),
    command: 'mocha --harmony --colors --recursive --reporter spec --require co-mocha test/lib/co-fs.js'
  };

  return config;
};
