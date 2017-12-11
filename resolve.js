#!/usr/bin/env node

/* eslint no-use-before-define: "off" */

'use strict';

if (!Object.values) {
  require('object.values').shim();
}

const Promise = require('bluebird');
const fs = Promise.promisifyAll(require('fs'));
const path = require('path');
const semver = require('semver');
const rglob = require('require-glob');
const utils = require('./utils');

var thisPackage = require(path.resolve(process.cwd(), 'package'));

if (!thisPackage.build) {
  console.error('This project does not appear to be an Open Sphere Closure ' +
      'Build project. Are you running this from the wrong directory?');
  process.exit(1);
}

if (process.argv.length < 3 || !process.argv[2]) {
  console.error('Please provide the output directory as an argument');
  process.exit(1);
}

var outputDir = path.resolve(process.cwd(), process.argv[2]);

// LOAD PLUGINS
var plugins = rglob.sync([
  path.join(__dirname, '/plugins/*/index.js'), // built in plugins
  'node_modules/opensphere-build-resolver-*/index.js'], // installed sibling plugins
  {
    cwd: process.cwd(),
    reducer: function(options, result, file, i, files) {
      // don't actually reduce, because that's incredibly annoying
      return files;
    }
  }).map(function(item) {
    return item.exports;
  });

const filterEmpty = function(item) {
  return Boolean(item);
};

const mapField = function(field) {
  return function(item) {
    return item[field];
  };
};

var resolvers = plugins.map(mapField('resolver')).filter(filterEmpty);
var writers = plugins.map(mapField('writer')).filter(filterEmpty);
var postResolvers = plugins.map(mapField('postResolver')).filter(filterEmpty);
// END PLUGIN LOAD

/**
 * Map of resolved package names to versions
 * @type {Object<string, string>}
 */
var resolved = {};

/**
 * The resolved directory for the root project (thisPackage)
 * @type {string}
 */
var rootProjectPath = null;

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
 * Resolves the dependencies of a package
 * @param {Object} pack The package.json
 * @param {string} projectDir The directory in which the current package was resolved
 * @param {number} depth The tree depth
 * @return {Promise} resolving all of the dependencies
 */
const resolveDependencies = function(pack, projectDir, depth) {
  if (pack.dependencies) {
    var deps = Object.keys(pack.dependencies);
    if (deps && pack.build) {
      deps = deps.filter(function(dep) {
        if (dep in resolved) {
          var resolvedVersion = resolved[dep];
          var requestedVersion = pack.dependencies[dep];

          if (semver.valid(requestedVersion) ||
              semver.validRange(requestedVersion)) {
            var value = semver.satisfies(resolvedVersion, requestedVersion);

            if (!value) {
              throw new Error('The package "' + pack.name + '" has a ' +
                'dependency on "' + dep + '" version ' +
                pack.dependencies[dep] + ' which has already been ' +
                'resolved as version ' + resolved[dep]);
            }

            return false;
          }

          console.log('WARNING: "' + dep + '" version "' +
              requestedVersion + '" was required by "' + pack.name + '" but ' +
              'is not a valid semver or semver range. "' + dep + '" was ' +
              'already resolved as version "' + resolvedVersion + '" and ' +
              'will be kept.');
        }

        return true;
      });

      return Promise.all(deps.map(function(dep) {
        return resolvePackage(dep, depth + 1, projectDir);
      }));
    }
  }

  return Promise.resolve();
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
 * Resolves the plugins for a package
 * @param {Object} pack The current package.json
 * @param {string} projectDir The current package path
 * @param {string} prefix The prefix before the plugin package name
 * @param {number} depth The current tree depth
 * @return {Promise} resolving all of the plugins
 */
const resolvePlugins = function(pack, projectDir, prefix, depth) {
  var indent = getIndent(depth);

  var pathsToTry = [
    path.resolve(projectDir, '../'),
    path.resolve(projectDir, 'node_modules'),
    path.resolve(rootProjectPath, 'node_modules')
  ];

  if (!pack.build || !pack.build.pluggable ||
      (utils.isAppPackage(thisPackage) && utils.isAppPackage(pack) &&
      depth > 0)) {
    // current package is not an Open Sphere Closure Project so stop
    return Promise.resolve();
  }

  console.log(indent + 'Resolving ' + pack.name + prefix + '*');

  return Promise.map(pathsToTry, function(p) {
    var priorityMap = {};
    return fs.readdirAsync(p)
      .catch({code: 'ENOENT'}, function() {})
      .filter(function(file) {
        if (!file.startsWith(pack.name + prefix)) {
          return false;
        }

        // check the peerDependencies semver
        var pluginPackPath = null;
        var pluginPack = null;

        try {
          pluginPackPath = path.resolve(p, file, 'package.json');
          pluginPack = require(pluginPackPath);
          // see if the plugin provides a flag to override the app version
          var overrideVersion = pluginPack.overrideVersion;
          if (overrideVersion) {
            fs.writeFileAsync(projectDir + '/.build/overrideVersion', pluginPack.version);
          }
        } catch (e) {
          console.error(pluginPackPath + ' does not exist');
          return false;
        }

        if (pluginPack.name in resolved) {
          // don't bother with plugins already resolved
          // this tends to occur in plugin builds
          return false;
        }

        if (pluginPack.build && pluginPack.build.type === 'config') {
          // don't enforce dependency checking for config packages
          return true;
        }

        // ensure it's a plugin
        if (!pluginPack.build || !pluginPack.build.type === 'plugin') {
          return false;
        }

        priorityMap[file] = pluginPack.build.priority || 0;

        // must have a dependency on the current package
        if (!pluginPack.dependencies ||
            !pluginPack.dependencies[pack.name]) {
          console.log('WARNING: The ' + pack.name + ' plugin ' + file +
            ' should have a dependency definition for ' + pack.name);
          return false;
        }

        // check that the required semver matches
        var required = pluginPack.dependencies[pack.name];
        if (!/^[=~^]?[\d.]+/.test(required)) {
          // the version was some other sort of dependency (e.g. git) and
          // we'll just take their word that it is going to work
          return true;
        }

        var value = semver.satisfies(pack.version, required);

        if (!value) {
          console.error('WARNING: ' + pluginPack.name + ' requires ' +
            pack.name + ' version ' + required +
            ' but the version is ' + pack.version);
        }

        return value;
      }).then(function(files) {
        files.sort(getPrioritySort(priorityMap));
        return files;
      })
      .map(function(file) {
        return resolvePackage(path.resolve(p, file), depth + 1);
      })
      .catch(TypeError, function() {
        Promise.resolve();
      });
  });
};

/**
 * Resolve a package by name
 * @param {string} name The package name to resolve
 * @param {number} depth The tree depth
 * @param {string} optDependent The dependent path from which to resolve
 * @return {Promise} resolving all the things
 */
const resolvePackage = function(name, depth, optDependent) {
  var indent = getIndent(depth);
  optDependent = optDependent || '';

  if (name in resolved) {
    console.log(indent + name + ' already resolved');
    return Promise.resolve();
  }

  var filesToTry = ['package.json', 'bower.json'];
  var pathsToTry = path.isAbsolute(name) ? [name] : [
    path.resolve(optDependent, '../', name),
    path.resolve(optDependent, 'node_modules', name),
    path.resolve(optDependent, 'bower_components', name),
    path.resolve(rootProjectPath, 'node_modules', name),
    path.resolve(rootProjectPath, 'bower_components', name)
  ];

  var pack = null;
  var reduceFiles = function(p, c) {
    if (p) {
      if (c && c.dependencies) {
        // merge any bower dependencies so that we look for those properly
        p.dependencies = Object.assign(p.dependencies || {}, c.dependencies);
      }
      return p;
    } else if (c) {
      return c;
    }
  };

  var tryPath = function(p) {
    return filesToTry.map(function(file) {
      try {
        return require(path.resolve(p, file));
      } catch (e) {
      }

      return null;
    });
  };

  var i = 0;
  for (var n = pathsToTry.length; i < n; i++) {
    pack = tryPath(pathsToTry[i]).reduce(reduceFiles);

    if (pack) {
      pack.dependencies = Object.assign(
          pack.dependencies || {},
          pack.peerDependencies || {});
      break;
    }
  }

  if (!pack) {
    throw new Error('Could not resolve module "' + name + '"');
  }

  var projectDir = pathsToTry[i];
  while (!projectDir.endsWith(name)) {
    projectDir = path.resolve(projectDir, '../');
  }
  console.log(indent + 'Resolved ' + pack.name + ' to ' + projectDir);
  if (!rootProjectPath) {
    rootProjectPath = projectDir;
  }

  resolved[pack.name] = pack.version;
  return Promise.map(resolvers, function(resolver) {
    return resolver(pack, projectDir, depth);
  })
  .then(resolveDependencies.bind(null, pack, projectDir, depth))
  .then(resolvePlugins.bind(null, pack, projectDir, '-plugin-', depth))
  .then(resolvePlugins.bind(null, pack, projectDir, '-config-', depth));
};

resolvePackage(process.cwd(), 0)
  .then(function() {
    console.log();

    return Promise.map(postResolvers, function(post) {
      return post(thisPackage, outputDir);
    });
  })
  .then(function() {
    return Promise.map(writers, function(writer) {
      return writer(thisPackage, outputDir);
    });
  })
  .catch(function(e) {
    console.error('There was an error resolving');
    console.error(e);
    process.exit(1);
  });
