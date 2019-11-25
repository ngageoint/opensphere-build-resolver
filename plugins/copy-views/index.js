'use strict';
const Promise = require('bluebird');
const fs = Promise.promisifyAll(require('fs'));
const path = require('path');
const utils = require('../../utils');
const slash = require('slash');

var dirs = [];

const resolver = function(pack, projectDir, depth, depStack) {
  if (pack.directories && pack.directories.views) {
    dirs.push({
      path: path.join(projectDir, pack.directories.views, '*'),
      name: pack.name,
      priority: (pack && pack.build) ? pack.build.priority || 0 : 0,
      group: utils.getGroup(depStack),
      depth: depth
    });
  }

  return Promise.resolve();
};

const writer = function(thisPackage, dir) {
  if (thisPackage.build.type === 'app') {
    dirs.sort(utils.priorityGroupDepthSort);
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
  dirs.length = [];
};

module.exports = {
  clear: clear,
  resolver: resolver,
  updater: utils.getGroupDepthUpdater(dirs),
  writer: writer
};
