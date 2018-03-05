'use strict';

const Promise = require('bluebird');
const fs = Promise.promisifyAll(require('fs'));
const path = require('path');
const utils = require('./utils');
const semver = require('semver');
var plugins = null;

/**
 * Resolves the dependencies of a package
 * @param {string} rootProjectPath The root project path
 * @param {Object<string, string>} alreadyResolved Map of package names to versions
 * @param {Object} pack The package.json
 * @param {string} projectDir The directory in which the current package was resolved
 * @param {number} depth The tree depth
 * @return {Promise} resolving all of the dependencies
 */
const resolveDependencies = function(rootProjectPath, alreadyResolved, pack, projectDir, depth) {
  if (pack.dependencies) {
    var deps = Object.keys(pack.dependencies);
    if (deps && pack.build) {
      deps = deps.filter(function(dep) {
        if (dep in alreadyResolved) {
          var resolvedVersion = alreadyResolved[dep];
          var requestedVersion = pack.dependencies[dep];

          if (semver.valid(requestedVersion) ||
              semver.validRange(requestedVersion)) {
            var value = semver.satisfies(resolvedVersion, requestedVersion);

            if (!value) {
              throw new Error('The package "' + pack.name + '" has a ' +
                'dependency on "' + dep + '" version ' +
                pack.dependencies[dep] + ' which has already been ' +
                'resolved as version ' + alreadyResolved[dep]);
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
        return resolvePackage(rootProjectPath, alreadyResolved, dep, depth + 1, projectDir);
      }));
    }
  }

  return Promise.resolve();
};

/**
 * Resolves the plugins for a package
 * @param {string} rootProjectPath The root project path
 * @param {Object<string, string>} alreadyResolved Map of package names to versions
 * @param {Object} pack The current package.json
 * @param {string} projectDir The current package path
 * @param {string} prefix The prefix before the plugin package name
 * @param {number} depth The current tree depth
 * @return {Promise} resolving all of the plugins
 */
const resolvePlugins = function(rootProjectPath, alreadyResolved, pack, projectDir, prefix, depth) {
  var indent = utils.getIndent(depth);
  alreadyResolved = alreadyResolved || {};

  var pathsToTry = [
    path.resolve(projectDir, '../'),
    path.resolve(projectDir, 'node_modules'),
    path.resolve(rootProjectPath, 'node_modules')
  ];

  var thisPackage = require(path.join(rootProjectPath, 'package'));

  if (!pack.build || !pack.build.pluggable ||
      (utils.isAppPackage(thisPackage) && utils.isAppPackage(pack) &&
      depth > 0)) {
    // current package is not an OpenSphere Closure Project so stop
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
        var pluginPackPath;
        var pluginPack;

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

        if (pluginPack.name in alreadyResolved) {
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
        files.sort(utils.getPrioritySort(priorityMap));
        return files;
      })
      .map(function(file) {
        return resolvePackage(rootProjectPath, alreadyResolved, path.resolve(p, file), depth + 1);
      })
      .catch(TypeError, function() {
        Promise.resolve();
      });
  });
};

/**
 * Resolve a package by name
 * @param {string} rootProjectPath The root project path
 * @param {Object<string, string>} alreadyResolved Map of package names to versions
 * @param {string} name The package name to resolve
 * @param {number} depth The tree depth
 * @param {string} optDependent The dependent path from which to resolve
 * @param {Object<string, Array<Function>>=} optPlugins optional set of plugin functions
 * @return {Promise} resolving all the things
 */
const resolvePackage = function(rootProjectPath, alreadyResolved, name, depth, optDependent, optPlugins) {
  var indent = utils.getIndent(depth);
  optDependent = optDependent || '';
  alreadyResolved = alreadyResolved || {};

  if (optPlugins) {
    plugins = optPlugins;
  }

  if (name in alreadyResolved) {
    console.log(indent + name + ' already resolved');
    return Promise.resolve();
  }

  var filesToTry = ['package.json', 'bower.json'];
  var pathsToTry = path.isAbsolute(name) ? [name] : [
    path.resolve(optDependent, '../', name),
    path.resolve(optDependent, 'node_modules', name),
    path.resolve(optDependent, 'bower_components', name),
    path.resolve(rootProjectPath, 'node_modules', name),
    path.resolve(rootProjectPath, 'bower_components', name),
    path.resolve(rootProjectPath, '../../node_modules', name)
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
  console.log(indent + 'Resolved ' + pack.name + '@' + pack.version + ' to ' + projectDir);
  if (!rootProjectPath) {
    rootProjectPath = projectDir;
  }

  alreadyResolved[pack.name] = pack.version;
  return Promise.map(plugins.resolvers, function(resolver) {
    return resolver(pack, projectDir, depth);
  })
  .then(resolveDependencies.bind(null, rootProjectPath, alreadyResolved, pack, projectDir, depth))
  .then(resolvePlugins.bind(null, rootProjectPath, alreadyResolved, pack, projectDir, '-plugin-', depth))
  .then(resolvePlugins.bind(null, rootProjectPath, alreadyResolved, pack, projectDir, '-config-', depth));
};

module.exports = {
  resolvePackage: resolvePackage,
  resolveDependencies: resolveDependencies,
  resolvePlugins: resolvePlugins
};
