const Promise = require('bluebird');
const fs = Promise.promisifyAll(require('fs'));

const _ = require('underscore');
const glob = require('glob');
const path = require('path');
const slash = require('slash');
const utils = require('../../utils');

var debugCss = {};
var debugScripts = {};
var distCss = {};
var distScripts = {};
var copyData = [];
var copyDirs = [];
var copyTargets = {};
var pageFiles = [];
var basePackage = null;
var basePath = null;

/**
 * Process resources that are required by the application.
 *
 * The resources should be an array of objects containing the following:
 *
 * `source`: The base path to copy from.
 * `target`: The destination path in the distribution.
 * `scripts`: JavaScript files that should be copied and included in a `script`
 *            tag.
 * `css`: CSS files that sould be copied and included in a `link` tag.
 * `resources`: Additional files that should be copied. Supports glob patterns.
 *
 * @param {Array<!Object>} pack The application `package.json`
 * @param {string} projectDir The base project directory
 * @param {number} depth The depth
 * @param {Array<string>} depStack The ancestry stack
 * @return {Promise} A promise that resolves when processing is complete
 */
const resolver = function(pack, projectDir, depth, depStack) {
  basePath = basePath || projectDir;

  // This block covers a couple of weird cases:
  //
  // appA  appA-plugin-x
  //   \    /
  //    \  /
  //    appB
  //
  // appB is treating appA and appA-plugin-x as libraries
  // rather than apps.

  if (!basePackage) {
    basePackage = pack;
  } else if (utils.isPluginPackage(pack) &&
      !utils.isPluginOfPackage(basePackage, pack)) {
    return Promise.resolve();
  }

  //
  // only resolve the index for application packages at the root level to avoid
  // conflicting/duplicate resources.
  //
  if (!pack.build || !pack.build.index ||
      (utils.isAppPackage(pack) && depth > 0)) {
    return Promise.resolve();
  }

  var indexFile = path.join(projectDir, pack.build.index);
  console.log('Loading index file for ' + pack.name + ' from ' + indexFile);

  var index;
  try {
    index = require(indexFile);
  } catch (e) {
    if (e.code === 'MODULE_NOT_FOUND') {
      console.log('Unable to load index file ' + indexFile);
    } else {
      console.error('ERROR: failed parsing index file');
    }

    throw e;
  }

  if (!index) {
    return Promise.resolve();
  }

  pageFiles.push(indexFile);

  const distPath = path.isAbsolute(index.distPath) ? index.distPath :
    path.join(process.cwd(), index.distPath);
  const appVersion = index.appVersion;
  const templates = index.templates;

  console.log('Resolving resources for ' + pack.name);

  return Promise.map(templates, function(template) {
    if (!template.id) {
      throw new Error('template id is not defined!');
    }

    if (!template.resources) {
      return Promise.resolve();
    }

    // initialize the lists of JavaScript/CSS files
    debugScripts[template.id] = debugScripts[template.id] || [];
    debugCss[template.id] = debugCss[template.id] || [];
    distScripts[template.id] = distScripts[template.id] || [];
    distCss[template.id] = distCss[template.id] || [];

    var debugPath = template.skip ? basePath : projectDir;

    return Promise.map(template.resources, function(resource) {
      if (!resource.source) {
        return Promise.resolve();
      }

      var targetDir = resource.target || '';
      var targetPath = path.join(distPath, appVersion, targetDir);

      var getDebugPath = function(filePath) {
        // get the real path for the debug build. this resolves symlinks to
        // prevent permissions errors caused by linked dependencies.
        try {
          var realPath = fs.realpathSync(filePath);
        } catch (e) {
          throw new Error('Resource resolver unable to find ' + filePath +
              '. Please ensure it exists or check your template config.');
        }

        // get the path to the resource, relative to the base directory
        return path.relative(debugPath, realPath);
      };

      var getDistPath = function(filePath) {
        // get the path to the copied resource, relative to the distribution
        // directory
        var relativePath = path.relative(resource.source, filePath);
        var target = path.resolve(targetPath, relativePath);

        return path.relative(distPath, target);
      };

      var getResourcePath = function(filePath) {
        return path.join(resource.source, filePath);
      };

      var filesToCopy = [];
      if (resource.scripts) {
        var scriptPaths = resource.scripts.map(getResourcePath);
        var templateDebugScripts = debugScripts[template.id];
        var templateDistScripts = distScripts[template.id];

        // build a list of the required scripts, relative to the base path
        templateDebugScripts.push(scriptPaths.map(getDebugPath));
        templateDistScripts.push(scriptPaths.map(getDistPath));

        // add the full paths to the list of files to copy
        filesToCopy = filesToCopy.concat(scriptPaths);
      }

      if (resource.css) {
        var cssPaths = resource.css.map(getResourcePath);
        var templateDebugCss = debugCss[template.id];
        var templateDistCss = distCss[template.id];

        // build a list of the required stylesheets, relative to the base path
        templateDebugCss.push(cssPaths.map(getDebugPath));
        templateDistCss.push(cssPaths.map(getDistPath));

        filesToCopy = filesToCopy.concat(cssPaths);
      }

      if (resource.files) {
        // resolve the glob patterns for required resources
        filesToCopy = filesToCopy.concat(_.flatten(resource.files.map(
          function(includePattern) {
            var globPath = path.join(resource.source, includePattern);
            var globFiles = glob.sync(globPath);
            if (!globFiles.length) {
              throw new Error('Resource resolver did not match any files with pattern: ' + globPath);
            }
            return globFiles;
          })));
      }

      if (filesToCopy.length > 0) {
        filesToCopy.forEach(function(file) {
          var relativePath = path.relative(resource.source, file);
          var target = path.resolve(targetPath, relativePath);

          if (!copyTargets[file]) {
            copyTargets[file] = [];
          }

          // only add the same source/target combination once
          if (copyTargets[file].indexOf(target) === -1) {
            copyTargets[file] = copyTargets[file] || [];
            copyTargets[file].push(target);

            // if the source is a directory, change the target to the
            // containing directory
            const targetDir = path.dirname(target);
            try {
              copyData.push({
                src: file,
                target: fs.statSync(file).isDirectory() ? targetDir : target,
                name: pack.name,
                priority: (pack && pack.build) ? pack.build.priority || 0 : 0,
                group: utils.getGroup(depStack),
                depth: depth
              });
            } catch (e) {
              throw new Error('Resource resolver unable to find ' + file +
                  '. Please ensure it exists or check your template config.');
            }

            // make sure the target directory exists so the copy doesn't fail
            if (copyDirs.indexOf(targetDir) === -1) {
              copyDirs.push(targetDir);
            }
          }
        });
      }

      return Promise.resolve();
    });
  });
};

const writeFiles = function(obj, dir, baseName) {
  var promises = [];

  for (var key in obj) {
    var files = _.flatten(obj[key]).map(slash);
    var filename = dir + path.sep + baseName + key;

    if (files.length) {
      console.log('Writing ' + filename);
      promises.push(fs.writeFileAsync(filename, files.join('\n')));
    }
  }

  return Promise.all(promises);
};

const writer = function(thisPackage, dir) {
  var fileMaps = [
    {obj: debugCss, baseName: 'resources-css-debug-'},
    {obj: debugScripts, baseName: 'resources-js-debug-'},
    {obj: distCss, baseName: 'resources-css-dist-'},
    {obj: distScripts, baseName: 'resources-js-dist-'},
    {obj: {pages: pageFiles}, baseName: 'resources-'}
  ];

  return Promise.map(fileMaps, function(fileMap) {
    return writeFiles(fileMap.obj, dir, fileMap.baseName);
  }, {concurrency: 1})
    .then(function() {
      const filename = path.join(dir, 'resources-copy-dirs');
      console.log('Writing ' + filename);
      return fs.writeFileAsync(filename, copyDirs.map(slash).join('\n'));
    })
    .then(function() {
      copyData.sort(utils.priorityGroupDepthSort);

      const content = copyData.map(function(data) {
        return '"' + slash(data.src) + '" "' + slash(data.target) + '"';
      });

      const filename = path.join(dir, 'resources-copy-files');
      console.log('Writing ' + filename);
      return fs.writeFileAsync(filename, content.join('\n'));
    });
};

const clear = function() {
  debugCss = {};
  debugScripts = {};
  distCss = {};
  distScripts = {};
  copyData = [];
  copyDirs = [];
  copyTargets = {};
  pageFiles = [];
};

module.exports = {
  clear: clear,
  resolver: resolver,
  updater: utils.getGroupDepthUpdater(copyData),
  writer: writer
};
