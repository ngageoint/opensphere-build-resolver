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

const load = function(includes, excludes) {
  var resolverPackage = require(path.resolve(__dirname, 'package'));

  // map include and exclude names to regex patterns for paths
  var pluginToRegex = function(name) {
    var pattern = path.sep + '(plugins' + path.sep + '|' + resolverPackage.name + '-)' + name + path.sep;
    return new RegExp(pattern);
  };

  includes = includes ? includes.map(pluginToRegex) : includes;
  excludes = excludes ? excludes.map(pluginToRegex) : excludes;

  var plugins = rglob.sync([
    // built in plugins
    path.join(__dirname, '/plugins/*/index.js'),
    // installed sibling plugins
    path.join('node_modules', resolverPackage.name + '-*', '/index.js')
  ],
  {
    cwd: process.cwd(),
    reducer: function(options, result, file, i, files) {
      // don't actually reduce, because that's incredibly annoying
      // for our case
      return files;
    }
  }).filter(function(item) {
    // includes take precedence over excludes
    var test = function(regex) {
      return regex.test(item.path);
    };

    var retVal = true;
    if (includes && includes.length) {
      retVal = includes.some(test);
    } else if (excludes && excludes.length) {
      retVal = !excludes.some(test);
    }

    console.log((retVal ? 'In' : 'Ex') + 'cluding plugin ' + item.path);

    return retVal;
  }).map(function(item) {
    return item.exports;
  });

  console.log();

  return {
    resolvers: plugins.map(mapField('resolver')).filter(filterEmpty),
    writers: plugins.map(mapField('writer')).filter(filterEmpty),
    updaters: plugins.map(mapField('updater')).filter(filterEmpty),
    postResolvers: plugins.map(mapField('postResolver')).filter(filterEmpty)
  };
};

module.exports = {
  load: load
};
