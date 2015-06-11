const T = module.exports = {};

T.sinon = require('sinon');
const chai = require('chai');

T.should = chai.should();
chai.config.includeStack = true;

T.sinonDoublistFs = require('..');
T.sinonDoublist = require('sinon-doublist');
T.fs = require('fs');
T.path = require('path');

T.Batch = require('batch');
