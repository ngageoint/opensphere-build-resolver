'use strict';
const Promise = require('bluebird');
const fs = Promise.promisifyAll(require('fs'));
const path = require('path');

var dirs = [];

var pluginRegex = /-(config|plugin)-/;
const resolver = function(pack, projectDir, depth) {
  if (pack.directories && pack.directories.onboarding) {
    dirs.push({
      path: path.join(projectDir, pack.directories.onboarding, '*'),
      depth: depth - (pluginRegex.test(pack.name) ? 1 : 0)
    });
  }

  return Promise.resolve();
};

const sort = function(a, b) {
  return b.depth - a.depth;
};

const writer = function(thisPackage, dir) {
  if (thisPackage.build.type === 'app') {
    dirs.sort(sort);
    var file = dirs.map(function(item) {
      return item.path;
    }).join('\n');

    var filename = path.join(dir, 'copy-onboarding-args');
    console.log('Writing ' + filename);
    return fs.writeFileAsync(filename, file);
  }

  return Promise.resolve();
};

const clear = function() {
  dirs = [];
};

module.exports = {
  clear: clear,
  resolver: resolver,
  writer: writer
};
