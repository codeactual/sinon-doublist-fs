module.exports = function(grunt) {
  'use strict';

  require('grunt-horde')
    .create(grunt)
    .demand('initConfig.projName', 'sinon-doublist-fs')
    .demand('initConfig.instanceName', 'sinonDoublistFs')
    .demand('initConfig.klassName', 'sinonDoublistFs')
    .demand('initConfig.harmony', require('semver').satisfies(process.version, '>=0.11.9'))
    .loot('node-component-grunt')
    .loot('./config/grunt')
    .attack();
};
