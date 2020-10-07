const Promise = require('bluebird');
const fs = Promise.promisifyAll(require('fs'));
const glob = require('glob');
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
 * @param {Array=} optDepStack Dependancy stack to check pluginPackage is a plugin to the parent
 * @return {boolean} If the plugin package is a plugin to the
 *  base package
 */
const isPluginOfPackage = function(basePackage, pluginPackage, optDepStack) {
  if (optDepStack && isPluginPackage(pluginPackage)) {
    // Grab the index of the current plugin
    const pluginIndex = optDepStack.findIndex((item) => {
      return item == pluginPackage.name;
    });

    // Get the parents name
    const parentName = pluginIndex > 0 ? optDepStack[pluginIndex - 1] : '';
    // If this is a plugin to the parent
    if (pluginPackage.name.indexOf(parentName + '-') === 0) {
      // If the parent IS the base package. Then this is a plugin of the package
      if (parentName == basePackage.name) {
        return true;
      } else {
        // Since this isnt a plugin to the base package, we only will accept it
        // if the parent is a library
        const parentPackage = getPackage(parentName);
        return parentPackage ? parentPackage.build.type === 'lib' : false;
      }
    } else {
      return false;
    }
  }
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
 * @param {string|undefined} globPattern Glob pattern to filter the list of files to search.
 * @return {Promise<Array<Object>>} A promise that resolves to the matched files.
 */
const findLines = function(pattern, directory, globPattern) {
  globPattern = globPattern || '**/*';

  return new Promise(function(resolve, reject) {
    // find all files in the directory matching the glob pattern
    glob(path.join(directory, globPattern), function(err, files) {
      if (!err) {
        getMatchingLines(pattern, files).then(resolve);
      } else {
        // directory not found
        resolve([]);
      }
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
  let group = groups.BASE;

  if (depStack) {
    let rootPackageName;
    let pluginRegex;
    let configRegex;

    for (let i = 0, n = depStack.length; i < n; i++) {
      if (i === 0) {
        rootPackageName = depStack[i];
        pluginRegex = new RegExp(`^${rootPackageName}-plugin-`);
        configRegex = new RegExp(`^${rootPackageName}-config`);
      } else {
        if (pluginRegex && pluginRegex.test(depStack[i])) {
          group = Math.max(group, groups.PLUGIN);
        } else if (configRegex && configRegex.test(depStack[i])) {
          group = Math.max(group, groups.CONFIG);
        }
      }
    }
  }

  return group;
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


/**
 * Update dependencies that have already been resolved.
 *
 * @param {Object} dependencies The package dependencies.
 * @param {Object} resolved Map of resolved dependencies.
 * @param {number} depth The current depth.
 * @param {Array<string>} depStack The current dependency stack.
 * @param {Function} updater The update function.
 * @param {Array<string>} updated Packages that have already been updated.
 *
 * @return {Promise} A promise that resolves when all dependencies have been updated.
 */
const updateDependencies = function(dependencies, resolved, depth, depStack, updater) {
  const promises = [];
  if (dependencies) {
    for (const key in dependencies) {
      const resolvedPack = resolved[key];

      // Only update a package once to avoid dependency cycles
      if (resolvedPack && resolvedPack.build && depStack.indexOf(resolvedPack.name) === -1) {
        const newDepth = depth + 1;
        const newDepStack = [...depStack, resolvedPack.name];
        promises.push(updater(resolvedPack, newDepth, newDepStack));
        promises.push(updateDependencies(resolvedPack.dependencies, resolved, newDepth, newDepStack,
          updater));
      }
    }
  }
  return Promise.all(promises);
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
  resolveModulePath: resolveModulePath,
  updateDependencies: updateDependencies
};
