#!/usr/bin/env node

'use strict';

if (!Object.values) {
  require('object.values').shim();
}

const argv = require('yargs')
  .array('include')
  .array('exclude')
  .argv;

const Promise = require('bluebird');
const pluginUtils = require('./plugins');
const core = require('./core');
const path = require('path');

var thisPackage = require(path.resolve(process.cwd(), 'package'));

if (!thisPackage.build) {
  console.error('This project does not appear to be an OpenSphere Closure ' +
      'Build project. Are you running this from the wrong directory?');
  process.exit(1);
}

if (!argv.outputDir) {
  console.error('Please provide the output directory as an argument');
  process.exit(1);
}

var plugins = pluginUtils.load(argv.include, argv.exclude);
var outputDir = path.resolve(process.cwd(), argv.outputDir);

core.resolvePackage(undefined, undefined, process.cwd(), 0, undefined, undefined, plugins)
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
