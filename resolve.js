#!/usr/bin/env node

'use strict';

if (!Object.values) {
  require('object.values').shim();
}

const Promise = require('bluebird');
const pluginUtils = require('./plugins');
const core = require('./core');

var thisPackage = require(path.resolve(process.cwd(), 'package'));

if (!thisPackage.build) {
  console.error('This project does not appear to be an OpenSphere Closure ' +
      'Build project. Are you running this from the wrong directory?');
  process.exit(1);
}

if (process.argv.length < 3 || !process.argv[2]) {
  console.error('Please provide the output directory as an argument');
  process.exit(1);
}

var plugins = pluginUtils.load();
var outputDir = path.resolve(process.cwd(), process.argv[2]);

core.resolvePackage(null, null, process.cwd(), 0)
  .then(function() {
    console.log();

    return Promise.map(plugins.postResolvers, function(post) {
      return post(thisPackage, outputDir);
    });
  })
  .then(function() {
    return Promise.map(plugins.writers, function(writer) {
      return writer(thisPackage, outputDir);
    });
  })
  .catch(function(e) {
    console.error('There was an error resolving');
    console.error(e);
    process.exit(1);
  });
