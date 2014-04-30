module.exports = function(grunt) {
  'use strict';

  var config = {};

  if (this.learn('initConfig.harmony')) {
    config.test = [this.learn('registerTask.test')[0].concat('shell:test_co_fs')];
  }

  return config;
};
