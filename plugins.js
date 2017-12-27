'use strict';

const rglob = require('require-glob');
const path = require('path');

const filterEmpty = function(item) {
  return Boolean(item);
};

const mapField = function(field) {
  return function(item) {
    return item[field];
  };
};

const load = function() {
  var resolverPackage = require(path.resolve(__dirname, 'package'));

  var plugins = rglob.sync([
  // built in plugins
  path.join(__dirname, '/plugins/*/index.js'),
  // installed sibling plugins
  path.join('node_modules', resolverPackage.name + '-*', '/index.js')],
  {
    cwd: process.cwd(),
    reducer: function(options, result, file, i, files) {
      // don't actually reduce, because that's incredibly annoying
      // for our case
      return files;
    }
  }).map(function(item) {
    return item.exports;
  });

  return {
    resolvers: plugins.map(mapField('resolver')).filter(filterEmpty),
    writers: plugins.map(mapField('writer')).filter(filterEmpty),
    postResolvers: plugins.map(mapField('postResolver')).filter(filterEmpty)
  };
};

module.exports = {
  load: load
};
