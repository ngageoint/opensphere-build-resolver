const Promise = require('bluebird');
const find = require('find');
const fs = Promise.promisifyAll(require('fs'));
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
    var parts = modulePath.split(/[\\\/]/);
    if (parts && parts.length) {
      // if the package is scoped, use the first two parts of the path. ie, @scope/package.
      var packageName = parts[0].startsWith('@') ? path.join(parts.shift(), parts.shift()) : parts.shift();
      var basePath = path.dirname(resolve.sync(path.join(packageName, 'package.json'), {
        basedir: optBasedir
      }));

      // join the remaining path to the resource (if any)
      return path.normalize(path.join(basePath, parts.join(path.sep)));
    }
  } catch (e) {
  }

  return undefined;
};

/**
 * Search a list of files for lines matching a pattern.
 * @param {!RegExp} pattern The pattern.
 * @param {!Array<string>} files The file paths to search.
 * @return {Promise<Array<Object>>} A promise that resolves to the matched files.
 */
const getMatchingLines = function(pattern, files) {
  return Promise.reduce(files, function(matches, file) {
    return fs.readFileAsync(file, 'utf8').then(function(content) {
      var lines = content.split(/[\r\n]+/).filter(function(line) {
        return pattern.test(line);
      });

      if (lines.length) {
        matches.push({
          file: file,
          lines: lines
        });
      }

      return matches;
    });
  }, []);
};

/**
 * Search files in a directory and return lines matching a pattern.
 * @param {RegExp} pattern The pattern to match.
 * @param {string} directory The directory to search.
 * @param {RegExp|undefined} filePattern Pattern to filter the list of files to search.
 * @return {Promise<Array<Object>>} A promise that resolves to the matched files.
 */
const findLines = function(pattern, directory, filePattern) {
  filePattern = filePattern || /./;

  return new Promise(function(resolve, reject) {
    // recursively find all files in the directory matching the file pattern
    find.file(filePattern, directory, function(files) {
      return getMatchingLines(pattern, files).then(resolve);
    }).error(function(err) {
      // directory not found
      resolve([]);
    });
  });
};

/**
 * Get the sort priority for a package.
 * @param {Object} pack The package.
 * @param {number} depth The package depth.
 * @param {Object} basePackage The base package.
 * @return {number} The sort priority.
 */
const getPackagePriority = function(pack, depth, basePackage) {
  //
  // use priority if specified, so the load order can be controlled by the package.
  // if no priority is present, use the resolved depth.
  //

  var priority = 0;

  if (pack) {
    if (pack.build && pack.build.priority !== undefined) {
      priority = pack.build.priority;
    } else {
      priority = -depth * 10;

      if (isConfigPackage(pack) ||
          (isPluginPackage(pack) && isPluginOfPackage(basePackage, pack))) {
        priority++;
      }
    }
  }

  return priority;
};


const groups = {
  BASE: 0,
  PLUGIN: 1000,
  CONFIG: 10000
};


/**
 * @param {?Array<string>} depStack
 * @return {number}
 */
const getGroup = function(depStack) {
  if (depStack) {
    if (depStack.some((dep) => /-config-/.test(dep))) {
      return groups.CONFIG;
    } else if (depStack.some((dep) => /-plugin-/.test(dep))) {
      return groups.PLUGIN;
    }
  }
  return groups.BASE;
};


/**
 * Sort config objects in ascending order.
 * @param {Object} a First object
 * @param {Object} b Second object
 * @return {number} The sort order
 */
const priorityGroupDepthSort = function(a, b) {
  const an = a.priority || a.group - a.depth;
  const bn = b.priority || b.group - b.depth;
  return an - bn;
};


/**
 * @param {Array<Object>} list
 * @return {function(Object, number, Array<string>):Promise}
 */
const getGroupDepthUpdater = function(list) {
  return (pack, depth, depStack) => {
    list.forEach(function(config) {
      if (config.name === pack.name) {
        const newGroup = getGroup(depStack);

        if (newGroup < config.group) {
          config.group = newGroup;
          config.depth = depth;
        } else if (newGroup === config.group) {
          config.depth = Math.max(depth, config.depth);
        }
      }
    });

    return Promise.resolve();
  };
};


module.exports = {
  findLines: findLines,
  isAppPackage: isAppPackage,
  isConfigPackage: isConfigPackage,
  isPluginPackage: isPluginPackage,
  isPluginOfPackage: isPluginOfPackage,
  flattenPath: flattenPath,
  Groups: groups,
  getPrioritySort: getPrioritySort,
  getGroup: getGroup,
  getGroupDepthUpdater: getGroupDepthUpdater,
  getIndent: getIndent,
  getPackage: getPackage,
  getPackagePriority: getPackagePriority,
  priorityGroupDepthSort: priorityGroupDepthSort,
  resolveModulePath: resolveModulePath
};
