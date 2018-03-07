const fs = require('fs');
const path = require('path');
const resolve = require('resolve');

/**
 * If a package is designated as an app.
 * @param {Object} pack The package
 * @return {boolean} If the package is an app
 */
const isAppPackage = function(pack) {
  return pack.build && pack.build.type === 'app';
};

/**
 * If a package is designated as a config pack.
 * @param {Object} pack The package
 * @return {boolean} If the package is a config pack
 */
const isConfigPackage = function(pack) {
  return pack.build && pack.build.type === 'config';
};

/**
 * If a package is designated as a plugin
 * @param {Object} pack The package
 * @return {boolean} If the package is a plugin
 */
const isPluginPackage = function(pack) {
  return pack.build && pack.build.type === 'plugin';
};

/**
 * @param {Object} basePackage The alleged base package
 * @param {Object} pluginPackage The alleged plugin package
 * @return {boolean} If the plugin package is a plugin to the
 *  base package
 */
const isPluginOfPackage = function(basePackage, pluginPackage) {
  return isPluginPackage(pluginPackage) &&
      pluginPackage.name.indexOf(basePackage.name + '-') === 0;
};

/**
 * Get the real file system path from a glob path.
 * @param {string} glob The glob path
 * @return {string} The real path
 */
const realPath = function(glob) {
  var wildIndex = glob.indexOf('*');
  if (wildIndex) {
    var prefix = glob.substr(0, wildIndex);
    if (prefix) {
      // resolve the portion of the path up to the first wildcard
      var suffix = glob.substr(wildIndex);
      return path.join(fs.realpathSync(prefix), suffix);
    }

    // started with a wildcard, return the original glob
    return glob;
  }

  // no wildcard, use the original path
  return fs.realpathSync(glob);
};

/**
 * @param {string} filePath The path
 * @return {string} The path or flattened path, whichever happens to exist
 */
const flattenPath = function(filePath) {
  try {
    filePath = realPath(filePath);
    fs.accessSync(filePath, 'r');
    return filePath;
  } catch (e) {
  }

  return filePath.replace(/node_modules.*node_modules/, 'node_modules');
};

/**
 * @param {Object<string, number>} map The map of files to priorities
 * @return {function(a: string, b: string):number} compare function for sorting
 */
const getPrioritySort = function(map) {
  /**
   * @param {string} a First item
   * @param {string} b Other item
   * @return {number} per compare functions
   */
  return function(a, b) {
    var pa = map[a] || 0;
    var pb = map[b] || 0;
    return pa - pb;
  };
};

/**
 * @param {number} depth The depth to indent
 * @return {string} The indent string
 */
const getIndent = function(depth) {
  var indent = '';
  for (var i = 1; i < depth; i++) {
    indent += '  ';
  }

  if (depth > 0) {
    indent += ' \u221F ';
  }

  return indent;
};

/**
 * Get the `package.json` as a JSON object for a package.
 * @param {string} packageName The package name.
 * @return {Object|undefined} The resolved `package.json`, or undefined if not found.
 */
const getPackage = function(packageName) {
  try {
    return require(path.join(packageName, 'package.json'));
  } catch (e) {
  }

  return undefined;
};

/**
 * Resolve the absolute path for a file/directory under `node_modules`.
 * @param {string} modulePath The relative path. Should begin with the module name.
 * @param {string=} optBasedir Optional paths to resolve module location from.
 * @return {string|undefined} The resolved path, or undefined if the module could not be found.
 */
const resolveModulePath = function(modulePath, optBasedir) {
  try {
    var parts = modulePath.split(path.sep);
    if (parts && parts.length) {
      // if the package is scoped, use the first two parts of the path. ie, @scope/package.
      var packageName = parts[0].startsWith('@') ? path.join(parts.shift(), parts.shift()) : parts.shift();
      var basePath = path.dirname(resolve.sync(path.join(packageName, 'package.json'), {
        basedir: optBasedir
      }));

      // join the remaining path to the resource (if any)
      return path.join(basePath, parts.join(path.sep));
    }
  } catch (e) {
  }

  return undefined;
};

module.exports = {
  isAppPackage: isAppPackage,
  isConfigPackage: isConfigPackage,
  isPluginPackage: isPluginPackage,
  isPluginOfPackage: isPluginOfPackage,
  flattenPath: flattenPath,
  getPrioritySort: getPrioritySort,
  getIndent: getIndent,
  getPackage: getPackage,
  resolveModulePath: resolveModulePath
};
