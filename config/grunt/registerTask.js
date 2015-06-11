module.exports = function exports() {
  'use strict';

  let config = {};

  config.test = [this.learn('registerTask.test')[0].concat('shell:test_co_fs')];

  return config;
};
