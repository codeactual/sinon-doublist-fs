module.exports = function(grunt) {
  'use strict';

  require('grunt-horde')
    .create(grunt)
    .demand('projName', 'sinon-doublist-fs')
    .demand('instanceName', 'sinonDoublistFs')
    .demand('klassName', 'sinonDoublistFs')
    .loot('node-component-grunt')
    .attack();
};
