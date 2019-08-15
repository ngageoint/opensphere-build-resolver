'use strict';

const Promise = require('bluebird');
const fs = Promise.promisifyAll(require('fs'));
const path = require('path');
const utils = require('../../utils');
const slash = require('slash');

/**
 * @fileOverview
 *
 * The nice thing about opensphere builds is that there is typically no need to re-run
 * the build to pick up changes to JS or HTML (just hit refresh!). To accomplish
 * this, each project has a goog.defines(<project>.ROOT, '../<project>/') call
 * that allows you to prefix paths. e.g. an Angular directive with a template:
 *
 * {
 *   templateUrl: someProject.ROOT + '/views/widget.html',
 *   ...
 * }
 *
 * This piece of the gcc plugin finds those defines and overrides them with the
 * correct values both in the debug build and in the compiled build.
 */

var defines = {};
var ignore = {};
var modules = {};

const resolver = function(pack, projectDir, depth) {
  if (pack.build) {
    if (utils.isAppPackage(pack) && depth > 0) {
      return Promise.resolve();
    }

    var regex = /'(.*\.ROOT)', '(.*?)'/;
    var relPath = path.relative(process.cwd(), projectDir) || '.';

    var srcDir = 'src';

    if (pack.directories) {
      srcDir = pack.directories.lib || srcDir;
      srcDir = pack.directories.src || srcDir;
    }

    if (pack.build.defineRoots) {
      defines = Object.assign(defines, pack.build.defineRoots);
    }

    if (pack.build.ignoreUncompiled) {
      ignore = Object.assign(ignore, pack.build.ignoreUncompiled);
    }

    if (pack.build.moduleDefines) {
      for (var key in pack.build.moduleDefines) {
        var value = pack.build.moduleDefines[key];
        var modulePath = utils.resolveModulePath(value, projectDir);
        if (modulePath) {
          modules[key] = slash(path.relative(projectDir, modulePath));
        } else {
          throw new Error('Unable to resolve module path for define ' + key + ' with path ' + value + '.');
        }
      };
    }

    var dir = path.resolve(projectDir, srcDir);

    var processDefine = function(line) {
      var results = regex.exec(line);

      if (results && results.length > 2) {
        // normalize the expected path with respect to the relative base path
        var origPath = results[2].replace(/[\\/]+$/, '');
        var definePath = path.normalize(path.join(relPath, origPath));

        defines[results[1]] = slash(definePath + path.sep);
      }

      regex.lastIndex = 0;
    };

    var processItem = function(item) {
      if (item && item.lines) {
        item.lines.forEach(processDefine);
      }
    };

    return utils.findLines(/^goog\.define\(/, dir, /\.js$/).then(function(list) {
      list.forEach(processItem);
    });
  }

  return Promise.resolve();
};

const adder = function(thisPackage, options) {
  if (utils.isAppPackage(thisPackage)) {
    // see if we passed in a value
    var grab = false;
    var value = null;

    for (var i = 0, n = process.argv.length; i < n && !value; i++) {
      if (grab) {
        value = process.argv[i];
        break;
      }

      grab = process.argv[i] === '--defineRoots';
    }

    if (value) {
      value = path.basename(value);

      // modify ROOT defines with the value
      var list = [];
      for (var key in defines) {
        list.push(key + '=\'' + value + path.sep + '\'');
      }

      if (list.length) {
        options.define = options.define ? options.define.concat(list) : list;
      }
    }

    if (options.define) {
      // put any hardcoded defines changes in the defines object to be written
      // out to CLOSURE_UNCOMPILED_DEFINES so they show up in debug mode
      var regex = /(SETTINGS|DEBUG)$/;
      options.define.forEach(function(def) {
        var parts = def.split('=');
        var key = parts[0];

        if (!(key in defines) && !regex.test(key)) {
          var value = parts[1].replace(/["']/g, '');
          if (value === 'true') {
            value = true;
          } else if (value === 'false') {
            value = false;
          } else if (value.length && !isNaN(Number(value))) {
            value = Number(value);
          }

          defines[key] = value;
        }
      });
    }
  }
};

const writer = function(thisPackage, outputDir) {
  if (utils.isAppPackage(thisPackage)) {
    // remove the "ignore uncompiled" list from the defines
    var defs = {};
    for (var key in defines) {
      if (!(key in ignore)) {
        defs[key] = defines[key];
      }
    }

    // add resolved module defines
    Object.assign(defs, modules);

    // write out the debug file
    var file = '// This file overrides goog.defines() calls for ' +
        '<project>.*.ROOT defines in the debug html\nvar ' +
        'CLOSURE_UNCOMPILED_DEFINES = ' + JSON.stringify(defs, null, 2) +
        ';';

    var filename = path.join(outputDir, 'gcc-defines-debug.js');
    console.log('Writing ' + filename);

    return fs.writeFileAsync(filename, file);
  }

  return Promise.resolve();
};

const clear = function() {
  defines = {};
  ignore = {};
  modules = {};
};

module.exports = {
  resolver: resolver,
  adder: adder,
  writer: writer,
  clear: clear
};
