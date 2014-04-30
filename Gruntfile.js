module.exports = function(grunt) {
  'use strict';

  require('grunt-horde')
    .create(grunt)
    .demand('initConfig.projName', 'sinon-doublist-fs')
    .demand('initConfig.instanceName', 'sinonDoublistFs')
    .demand('initConfig.klassName', 'sinonDoublistFs')
    .loot('node-component-grunt')
    .loot('./config/grunt')
    .attack();
};
