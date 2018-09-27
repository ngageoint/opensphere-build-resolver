'use strict';

const Promise = require('bluebird');
const fs = Promise.promisifyAll(require('fs'));
const mkdirp = Promise.promisifyAll({
  mkdirp: require('mkdirp')
});
const path = require('path');
const utils = require('../../utils');
const clone = require('clone');

var electronDeps = {};

const resolver = function(pack, projectDir, depth) {
  if (pack.build && pack.build.electron) {
    if (!Array.isArray(pack.build.electron)) {
      throw new Error(path.join(projectDir, 'package.json') + 'build.electron must be an ' +
          'array of package names to include in the Electron build');
    }

    var deps = pack.dependencies || {};

    electronDeps = pack.build.electron.reduce(function(result, dep) {
      if (!(dep in deps)) {
        throw new Error(path.join(projectDir, 'package.json') + ' build.electron contains "' +
            dep + '" which does not exist in dependencies');
      }

      result[dep] = deps[dep];
      return result;
    }, electronDeps);
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
  console.log('Writing ' + file);

  return mkdirp.mkdirpAsync(dir)
    .then(function() {
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
    });
};

const clear = function() {
  electronDeps = {};
};

module.exports = {
  resolver: resolver,
  writer: writer,
  clear: clear
};
