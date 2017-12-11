'use strict';

const Promise = require('bluebird');
const fs = Promise.promisifyAll(require('fs'));
const grep = require('simple-grep');
const path = require('path');

var srcPaths = [];

var shortcuts = {
  'google-closure-library': function(pack, projectDir) {
    srcPaths.push('!' + path.resolve(projectDir, 'third_party', '**test.js'));
    srcPaths.push('!' + path.resolve(projectDir, 'closure', 'goog',
          '**test.js'));
    srcPaths.push(path.resolve(projectDir, 'third_party', '**.js'));
    srcPaths.push(path.resolve(projectDir, 'closure', 'goog', '**.js'));
    return Promise.resolve();
  },
  'openlayers': function(pack, projectDir) {
    //
    // this is a workaround to allow dependency_mode=STRICT, which will ignore
    // typedefs.js due to lack of goog.provides.
    //
    // projects compiled in strict mode with openlayers must include typedefs.js
    // as an extern, and this exclusion ensures the compile doesn't throw an
    // error due to duplicate source files.
    //
    srcPaths.push('!' + path.resolve(projectDir, 'src', 'ol', 'typedefs.js'));
    srcPaths.push(path.resolve(projectDir, 'src', '**.js'));
    srcPaths.push(path.resolve(projectDir, 'build', 'ol.ext', '**.js'));
    return Promise.resolve();
  }
};

var overrides = {};

const shortcut = function(pack, projectDir) {
  var mapPath = function(p) {
    return path.resolve(projectDir, p);
  };

  if (pack.build && 'gcc-src-overrides' in pack.build) {
    var packOverrides = pack.build['gcc-src-overrides'];

    if (packOverrides) {
      for (var key in packOverrides) {
        packOverrides[key] = packOverrides[key].map(mapPath);
      }

      overrides = Object.assign(overrides, packOverrides);
    }
  }

  if (pack.name in overrides) {
    srcPaths = srcPaths.concat(overrides[pack.name]);
    return Promise.resolve();
  }

  if (pack.name in shortcuts) {
    return shortcuts[pack.name](pack, projectDir);
  }

  if (pack.build && 'gcc-src' in pack.build) {
    srcPaths = srcPaths.concat(pack.build['gcc-src'].map(mapPath));
    return Promise.resolve();
  }
};

const getSourcePaths = function(pack, dir) {
  var likelySrcDirs = {
    lib: true,
    src: true
  };

  if (pack.directories) {
    if (pack.directories.src) {
      likelySrcDirs[pack.directories.src] = true;
    }

    if (pack.directories.lib) {
      likelySrcDirs[pack.directories.lib] = true;
    }
  }

  return fs.readdirAsync(dir)
    .filter(function(file) {
      return file in likelySrcDirs;
    });
};

const resolveSrc = function(pack, projectDir) {
  // some well-known libraries have shortcuts
  var sc = shortcut(pack, projectDir);

  if (sc) {
    return sc;
  }

  return getSourcePaths(pack, projectDir)
    .map(function(filename) {
      filename = path.resolve(projectDir, filename);

      return new Promise(function(resolve, reject) {
        // grep the filename for goog.provide's
        grep('goog.provide', filename, function(list) {
          var srcSet = list.reduce(function(p, c) {
            if (c.file.indexOf('Binary') > -1) {
              // ignore binary files
              return p;
            }

            var itemPath = path.dirname(c.file) + path.sep;

            // see if a parent path is already in the set
            var keys = Object.keys(p);
            var found = false;
            for (var i = 0, n = keys.length; i < n; i++) {
              var key = keys[i];
              if (itemPath.indexOf(key) === 0) {
                found = true;
              } else if (key.indexOf(itemPath) === 0) {
                // our current filename is shorter, so replace the key
                delete p[key];
                p[itemPath] = true;
                found = true;
              }
            }

            // otherwise add it
            if (!found) {
              p[itemPath] = true;
            }

            return p;
          }, {});

          srcPaths = srcPaths.concat(Object.keys(srcSet).map(function(p) {
            return path.resolve(p, '**.js');
          }));

          resolve();
        });
      });
    });
};

/**
 * @param {Object} basePackage package.json for the root/base package
 * @param {string} dir The output directory
 * @return {Promise} that resolves when the require-all.js file is created
 */
const createRequireAll = function(basePackage, dir) {
  // create require-all file
  if (basePackage.build.type !== 'app') {
    var requireAllFile = dir + '/require-all.js';
    srcPaths.push(requireAllFile);

    // start by grepping out all goog.provides and changing them to a list of goog.require's
    return getSourcePaths(basePackage, process.cwd())
      .map(function(dir) {
        return new Promise(function(resolve, reject) {
          dir = path.resolve(process.cwd(), dir);
          grep('goog.provide', dir, function(list) {
            resolve(list.reduce(function(prev, curr) {
              return prev.concat(curr.results.map(function(result) {
                if (curr.file.endsWith('.js') && result && result.line) {
                  return result.line.replace('goog.provide', 'goog.require');
                }

                return undefined;
              }));
            }, []));
          });
        });
      })
      .then(function(listOfLists) {
        return listOfLists.reduce(function(p, c) {
          return p.concat(c);
        }, []);
      })
      .then(function(list) {
        list = list.filter(function(item) {
          return Boolean(item);
        });

        return fs.readFileAsync(
          path.resolve(__dirname, 'require-all-template.js'), 'utf8')
          .then(function(template) {
            console.log('Writing ' + requireAllFile +
                ' for library compilation');
            template = template.replace('// REPLACE', list.join('\n'));
            return fs.writeFileAsync(requireAllFile, template);
          });
      });
  }

  return Promise.resolve();
};

const addOptions = function(pack, options) {
  options.js = srcPaths;
};

const clear = function() {
  srcPaths = [];
};

module.exports = {
  clear: clear,
  resolver: resolveSrc,
  postResolver: createRequireAll,
  adder: addOptions
};
