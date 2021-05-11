'use strict';

const Promise = require('bluebird');
const fs = Promise.promisifyAll(require('fs'));
const mkdirp = require('mkdirp');
const path = require('path');
const rimraf = Promise.promisify(require('rimraf'));
const utils = require('../../utils');
const clone = require('clone');

var electronDeps = {};
var preloadScripts = [];

const resolvePackages = function(pack, projectDir, packages) {
  if (packages) {
    if (!Array.isArray(packages)) {
      throw new Error(path.join(projectDir, 'package.json') + 'build.electron.packages must be an ' +
          'array of package names to include in the Electron build');
    }

    var deps = pack.dependencies || {};

    electronDeps = packages.reduce(function(result, dep) {
      if (!(dep in deps)) {
        throw new Error(path.join(projectDir, 'package.json') + ' build.electron.packages contains "' +
            dep + '" which does not exist in dependencies');
      }

      result[dep] = deps[dep];
      return result;
    }, electronDeps);
  }
};

const resolvePreload = function(pack, projectDir, preload, depth, depStack) {
  if (preload) {
    if (!Array.isArray(preload)) {
      throw new Error(path.join(projectDir, 'package.json') + 'build.electron.preload must be a ' +
          'path to a preload script');
    }

    preload.forEach(function(script) {
      var scriptPath = path.resolve(projectDir, script);
      if (!fs.existsSync(scriptPath)) {
        throw new Error(path.join(projectDir, 'package.json') + 'build.electron.preload path does not exist: ' +
            scriptPath);
      }

      preloadScripts.push({
        path: scriptPath,
        name: pack.name,
        priority: (pack && pack.build) ? pack.build.priority || 0 : 0,
        group: utils.getGroup(depStack),
        depth: depth
      });
    });
  }
};

const resolver = function(pack, projectDir, depth, depStack) {
  if (pack.build && pack.build.electron) {
    resolvePackages(pack, projectDir, pack.build.electron.packages);
    resolvePreload(pack, projectDir, pack.build.electron.preload, depth, depStack);
  }

  return Promise.resolve();
};

const writer = function(thisPackage, outputDir) {
  try {
    var electronPath = utils.resolveModulePath('opensphere-electron');
    var pack = require(path.resolve(electronPath, 'package.json'));
  } catch (e) {
    // no Electron package installed, no big deal
    return Promise.resolve();
  }

  var dir = path.join(electronPath, 'app');
  var file = path.join(dir, 'package.json');
  var preloadDir = path.join(dir, 'src', 'preload');

  // recreate the preload script directory. scripts will be copied each time the resolver runs.
  return rimraf(preloadDir).then(function() {
    return mkdirp(preloadDir)
      .then(function() {
        console.log('Writing ' + file);

        // copy from base package
        var appPack = clone(pack);

        // ditch devDeps other than electron
        var devDeps = appPack.devDependencies;
        for (var dep in devDeps) {
          if (!dep.startsWith('electron')) {
            delete devDeps[dep];
          }
        }

        // ditch other deps
        delete appPack.peerDependencies;
        delete appPack.optionalDependencies;

        // set dependencies to resolved versions
        appPack.dependencies = Object.assign(appPack.dependencies, electronDeps);
        appPack.main = appPack.main.replace(/^app\//, '');

        return fs.writeFileAsync(file, JSON.stringify(appPack, null, 2));
      })
      .then(function() {
        // get the real path to avoid symlink issues
        preloadDir = fs.realpathSync(preloadDir);

        preloadScripts.sort(utils.priorityGroupDepthSort);

        // copy each preload script to the target directory
        return Promise.map(preloadScripts, function(script, idx, arr) {
          // increment preload file names. Electron will load everything in the directory.
          var dest = path.join(preloadDir, 'preload' + idx + '.js');

          console.log('Writing Electron preload script: ' + dest);

          return fs.copyFileAsync(script.path, dest, fs.constants.COPYFILE_EXCL);
        });
      });
  });
};

const clear = function() {
  electronDeps = {};
  preloadScripts = [];
};

module.exports = {
  resolver: resolver,
  writer: writer,
  clear: clear
};
