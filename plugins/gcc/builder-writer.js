'use strict';

const Promise = require('bluebird');
const fs = Promise.promisifyAll(require('fs'));
const path = require('path');

/**
 * Strip the `goog:` prefix off gcc entry_point arguments.
 * @param {string} entryPoint The entry point to strip
 * @return {string} The stripped entry point
 */
const stripGoog = function(entryPoint) {
  return entryPoint.replace(/goog:/, '');
};

/**
 * Get the directory for a file path.
 * @param {string} file The file path
 * @return {string} The directory
 */
const getDir = function(file) {
  return path.dirname(file);
};

/**
 * Filter out exclusion glob patterns.
 * @param {string} pattern The pattern
 * @return {boolean} If the pattern is an exclusion
 */
const notExclude = function(pattern) {
  return !pattern.startsWith('!');
};

/**
 * Create a Closure builder namespace argument.
 * @param {string} ns The namespace
 * @return {string} The argument
 */
const createNamespace = function(ns) {
  return '--namespace=' + ns;
};

/**
 * Create a Closure builder root argument.
 * @param {string} dir The directory
 * @return {string} The argument
 */
const createRoot = function(dir) {
  return '--root=' + dir;
};

const writer = function(basePackage, dir, options) {
  var args = [];
  if (options) {
    if (options.js) {
      args = args.concat(options.js
        .filter(notExclude)
        .map(getDir)
        .map(createRoot));
    }

    if (options.entry_point) {
      var entryPoints = options.entry_point;
      if (!(entryPoints instanceof Array)) {
        entryPoints = [entryPoints];
      }

      args = args.concat(entryPoints.map(stripGoog).map(createNamespace));
    }
  }

  var argsPath = path.join(dir, 'gcb-python-args');
  console.log('Writing ' + argsPath);
  return fs.writeFileAsync(argsPath, args.join(' '));
};

module.exports = {
  writer: writer
};
