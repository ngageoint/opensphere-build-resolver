'use strict';

const Promise = require('bluebird');
const fs = Promise.promisifyAll(require('fs'));
const path = require('path');
const utils = require('../../utils');

var configs = [];
var basePackage = null;

const resolver = function(pack, projectDir, depth) {
  basePackage = basePackage || pack;

  if (pack.build && pack.build.config) {
    var list = pack.build.config;
    if (!(list instanceof Array)) {
      list = [list];
    }

    return Promise.mapSeries(list, function(item) {
      var file = path.relative(process.cwd(), path.join(
          projectDir, item));

      var readFile = function(file) {
        return fs.readFileAsync(file, 'utf8')
            .then(function(content) {
              configs.push({
                path: file,
                depth: utils.getPackagePriority(pack, depth, basePackage),
                content: JSON.parse(content)
              });
            });
      };

      var readDir = function(dir) {
        return fs.readdirAsync(dir)
            .catch({code: 'ENOENT'}, function() {
              return Promise.resolve([]);
            })
            .map(function(file) {
              return path.join(dir, file);
            })
            .mapSeries(readFile);
      };

      return file.endsWith('.json') ? readFile(file) :
        readDir(file);
    });
  }

  return Promise.resolve();
};

/**
 * Sort config objects in ascending order.
 * @param {Object} a First object
 * @param {Object} b Second object
 * @return {number} The sort order
 */
const sort = function(a, b) {
  return a.depth - b.depth;
};

/**
 * @param {?} val The value to check
 * @return {boolean} Whether or not the value is a primitive
 */
const isPrimitive = function(val) {
  return val instanceof Array || typeof val !== 'object';
};

/**
 * The key to use to delete a value during merges
 * @type {string}
 */
var DELETE_VAL = '__delete__';

/**
 * Merges two objects
 * @param {Object} from The object to merge
 * @param {Object} to The object to which to merge
 */
const merge = function(from, to) {
  for (var key in from) {
    var fval = from[key];

    if (key in to) {
      var tval = to[key];

      if (fval === DELETE_VAL) {
        delete to[key];
      } else if (isPrimitive(fval) || isPrimitive(tval)) {
        to[key] = from[key];
      } else {
        merge(fval, tval);
      }
    } else if (isPrimitive(fval)) {
      to[key] = fval;
    } else {
      // don't set the value to an Object, or changes to the target will affect the source
      to[key] = {};
      merge(fval, to[key]);
    }
  }
};

const writeDebug = function(pack, outputDir) {
  var overrides = configs.map(function(item) {
    return item.path;
  });

  var debug = {
    overrides: overrides
  };

  var file = path.join(outputDir, 'settings-debug.json');
  console.log('Writing ' + file);
  return fs.writeFileAsync(file, JSON.stringify(debug, null, 2));
};

const writeDist = function(outputDir) {
  var config = configs.reduce(function(p, c) {
    merge(c.content, p);
    return p;
  }, {});

  delete config.overrides;
  var file = path.join(outputDir, 'settings.json');
  console.log('Writing ' + file);
  return fs.writeFileAsync(file, JSON.stringify(config));
};

const writer = function(thisPackage, outputDir) {
  if (configs.length) {
    configs.sort(sort);

    return Promise.join(
        writeDist(outputDir),
        writeDebug(thisPackage, outputDir));
  }

  return Promise.resolve();
};

const clear = function() {
  configs = [];
};

module.exports = {
  clear: clear,
  resolver: resolver,
  writer: writer
};
