'use strict';

const Promise = require('bluebird');
const fs = Promise.promisifyAll(require('fs'));
const path = require('path');

var resolved = {};

const resolver = function(pack, projectDir, depth) {
  if (!(pack.name in resolved)) {
    resolved[pack.name] = projectDir;
  }

  return Promise.resolve();
};

const writer = function(thisPackage, outputDir) {
  var file = path.resolve(outputDir, 'resolved.json');
  console.log('Writing ' + file);
  return fs.writeFileAsync(file, JSON.stringify(resolved, null, 2));
};

const clear = function() {
  resolved = {};
};

module.exports = {
  clear: clear,
  resolver: resolver,
  writer: writer
};
