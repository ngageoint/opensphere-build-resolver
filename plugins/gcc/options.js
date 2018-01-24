'use strict';
const path = require('path');
const utils = require('../../utils');

var optionsFound = [];

var pathKeys = ['conformance_configs', 'js', 'externs', 'output_wrapper_file'];
var multiValueKeys = [
  'define',
  'externs',
  'extra_annotation_name',
  'entry_point',
  'hide_warnings_for',
  'js',
  'jscomp_error',
  'jscomp_off',
  'jscomp_warning',
  'module'
];

const resolver = function(pack, projectDir) {
  var options = pack.build ? pack.build.gcc : null;
  if (options) {
    // resolve paths for path keys
    var mapPaths = function(item) {
      var exclusion = false;

      if (item.startsWith('!')) {
        exclusion = true;
        item = item.substring(1);
      }

      // try to resolve the item by walking node_modules
      var packagePath = utils.resolveModulePath(item, projectDir);
      if (packagePath) {
        return (exclusion ? '!' : '') + packagePath;
      }

      // resolve the path from the project directory if not found in node_modules
      return (exclusion ? '!' : '') +
        utils.flattenPath(path.resolve(projectDir, item));
    };

    for (var key in options) {
      if (options.hasOwnProperty(key) && pathKeys.indexOf(key) > -1) {
        var value = options[key];

        if (!(value instanceof Array)) {
          value = [value];
        }

        options[key] = value.map(mapPaths);
      }
    }

    optionsFound.unshift(options);
  }

  return Promise.resolve();
};

const toArray = function(item) {
  if (!item) return item;
  return !(item instanceof Array) ? [item] : item;
};

const adder = function(pack, options) {
  optionsFound.reduce(function(options, curr) {
    for (var key in curr) {
      var value = curr[key];

      if (typeof value === 'boolean' || multiValueKeys.indexOf(key) === -1) {
        options[key] = value;
      } else {
        // everything else is an array? This is technically not true,
        // but it is true for everything I can think of modifying on an
        // individual project level.
        var currValue = options[key];
        currValue = toArray(currValue);
        value = toArray(value);

        if (currValue) {
          if (key === 'externs') {
            options[key] = value.concat(currValue);
          } else {
            options[key] = currValue.concat(value);
          }
        } else {
          options[key] = value;
        }
      }
    }

    return options;
  }, options);

  pathKeys.forEach(function(key) {
    var list = options[key];
    if (list) {
      list.sort();
    }
  });
};

const clear = function() {
  optionsFound.length = 0;
};

module.exports = {
  resolver: resolver,
  adder: adder,
  clear: clear
};
