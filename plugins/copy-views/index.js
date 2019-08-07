'use strict';
const Promise = require('bluebird');
const fs = Promise.promisifyAll(require('fs'));
const path = require('path');
const slash = require('slash');

var dirs = [];

var pluginRegex = /-(config|plugin)-/;
const resolver = function(pack, projectDir, depth) {
  if (pack.directories && pack.directories.views) {
    dirs.push({
      path: path.join(projectDir, pack.directories.views, '*'),
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
      return slash(item.path);
    }).join('\n');

    var filename = path.join(dir, 'copy-views-args');
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
