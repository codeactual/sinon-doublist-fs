module.exports = function(grunt) {
  'use strict';

  return {
    test: [this.learn('registerTask.test')[0].concat('shell:test_co_fs')]
  };
};
