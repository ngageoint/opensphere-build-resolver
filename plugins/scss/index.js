'use strict';

const Promise = require('bluebird');
const fs = Promise.promisifyAll(require('fs'));
const find = require('find');
const path = require('path');
const concat = Promise.promisifyAll({
  concat: require('concat-files')
});
const mkdirp = Promise.promisifyAll({
  mkdirp: require('mkdirp')
});

const utils = require('../../utils');

var directories = {};
var scssPaths = [];
var scssEntries = [];
var basePackage = null;

var scssShortcuts = {
  'compass-mixins': 'compass-mixins/lib',
  'bootstrap': 'bootstrap/scss',
  'bootswatch': 'bootswatch/dist'
};

const resolver = function(pack, projectDir, depth) {
  basePackage = basePackage || pack;

  // skip config packages
  if (utils.isConfigPackage(pack)) {
    return Promise.resolve();
  }

  directories[pack.name] = projectDir;

  if (pack.dependencies) {
    for (var dep in pack.dependencies) {
      var shortcut = scssShortcuts[dep];
      if (shortcut) {
        // try to resolve the path by walking node_modules
        var scssPath = utils.resolveModulePath(shortcut, projectDir);

        if (!scssPath) {
          // resolve the path from the project directory if not found in node_modules
          scssPath = utils.flattenPath(path.resolve(projectDir, 'node_modules/' + shortcut));
        }

        if (scssPath) {
          console.log(dep + ' resolved to ' + scssPath);
          scssPaths.push(scssPath);
        }
      }
    }
  }

  if (pack.directories && pack.directories.scss) {
    var dirs = pack.directories.scss;
    dirs = typeof dirs === 'string' ? [dirs] : dirs;

    scssPaths = scssPaths.concat(dirs.map(function(dir) {
      return path.resolve(projectDir, dir);
    }));
  }

  if (pack.build && pack.build.scssPaths && Array.isArray(pack.build.scssPaths)) {
    scssPaths = scssPaths.concat(pack.build.scssPaths.map(function(dir) {
      var p = utils.resolveModulePath(dir, projectDir);
      return p ? p : path.resolve(projectDir, dir);
    }));
  }

  // don't include scss entries for app packages other than the root level
  if (pack.build && pack.build.scss && ((!utils.isAppPackage(pack) &&
      utils.isPluginOfPackage(basePackage, pack)) || depth === 0)) {
    var value = pack.build.scss;

    if (!(value instanceof Array)) {
      value = [value];
    }

    value = value.map(function(item) {
      return path.relative(process.cwd(), path.join(projectDir, item));
    });

    scssEntries = scssEntries.concat(value);
  }

  return Promise.resolve();
};

const COLOR_REGEX = /colors?$/;
const MIXIN_REGEX = /mixins?$/;

const isMixin = function(file) {
  return MIXIN_REGEX.test(file);
};

const isColor = function(file) {
  return COLOR_REGEX.test(file);
};

const isRegular = function(file) {
  return !MIXIN_REGEX.test(file) && !COLOR_REGEX.test(file);
};

const addScssRequires = function(pack, dir) {
  // add all requires to index.js
  if (pack.build && !utils.isAppPackage(pack) && !utils.isPluginPackage(pack) &&
      pack.directories && pack.directories.scss) {
    var base = directories[pack.name];
    var file = path.resolve(dir, 'require-all.scss');
    var scssDir = path.resolve(base, pack.directories.scss);

    return new Promise(function(resolve, reject) {
      find.file(/\.scss$/, scssDir, function(files) {
        files = files.map(function(file) {
          return file.replace(scssDir + path.sep, '')
            .replace(/_(.*)\.scss$/, '$1');
        });

        var colors = files.filter(isColor);
        var mixins = files.filter(isMixin);
        var rest = files.filter(isRegular);

        files = colors.concat(mixins).concat(rest);

        resolve(fs.readFileAsync(path.resolve(__dirname, 'require-all.scss'), 'utf8')
          .then(function(template) {
            console.log('Writing ' + file + ' for library scss compilation');
            template += '\n@import "' + files.join('";\n@import "') + '";';
            return fs.writeFileAsync(file, template);
          }));
      });
    });
  }

  return Promise.resolve();
};

const writer = function(thisPackage, outputDir) {
  if (scssPaths.length || scssEntries.length) {
    var options = {
      'include-path': scssPaths
    };

    var args = [];

    for (var key in options) {
      var value = options[key];

      for (var i = 0, n = value.length; i < n; i++) {
        args.push('--' + key);
        args.push(value[i]);
      }
    }

    var promises = [];
    var file = null;

    if (thisPackage.build && thisPackage.build.type !== 'app' &&
        thisPackage.build.type !== 'plugin') {
      // define the input as the require-all.scss file we just wrote above
      args.push(path.resolve(outputDir, 'require-all.scss'));
    } else {
      file = path.resolve(outputDir, 'combined.scss');
      args.push(file);
      console.log('Writing ' + file);
      promises.push(concat.concatAsync(scssEntries, file));
    }

    file = path.resolve(outputDir, 'node-sass-args');
    console.log('Writing ' + file);
    promises.push(fs.writeFileAsync(file, args.join(' ')));

    return Promise.all(promises)
      .then(function() {
        // Write a file for each theme also
        if (utils.isAppPackage(thisPackage) &&
            thisPackage.build.scss &&
            thisPackage.build.themes &&
            thisPackage.build.themes.length) {
          // Take off the combined.scss generic file
          args.pop();

          var themeDir = outputDir + '/themes';
          return mkdirp.mkdirpAsync(themeDir)
            .then(function() {
              var promises = [];
              thisPackage.build.themes.push('default');

              // For all the themes, create a combined.scss and a node-sass-args file
              thisPackage.build.themes.forEach(function(theme) {
                var themeOutput = path.resolve(themeDir, theme + '.combined.scss');
                var themeArgs = path.resolve(themeDir, theme + '.node-sass-args');
                promises.push(fs.writeFileAsync(themeArgs, args.join(' ') + ' ' + themeOutput));
                promises.push(fs.readFileAsync(path.resolve(outputDir, 'combined.scss'), 'utf8')
                  .then(function(fileContents) {
                    console.log('Creating combined.scss for ' + theme + ' theme');

                    // Add the theme name to a class for stylesheet load detection.
                    fileContents = '.u-loaded-theme::before { content: "' + theme + '"; }\n' + fileContents;

                    // Prepend and Append our theme around the bootstrap entry
                    var bootstrapEntry = '@import \'bootstrap\';';
                    if (theme != 'default') {
                      fileContents = fileContents.replace(bootstrapEntry,
                        '@import \'' + theme + '/_variables\';' +
                        '\n' + bootstrapEntry + '\n' +
                        '@import \'' + theme + '/_bootswatch\';');
                    }
                    return fs.writeFileAsync(themeOutput, fileContents);
                  }));
              });
              return Promise.all(promises);
            });
        } else {
          return Promise.resolve();
        }
      });
  }

  return Promise.resolve();
};

const clear = function() {
  directories = {};
  scssPaths = [];
  scssEntries = [];
};

module.exports = {
  clear: clear,
  resolver: resolver,
  postResolver: addScssRequires,
  writer: writer
};
