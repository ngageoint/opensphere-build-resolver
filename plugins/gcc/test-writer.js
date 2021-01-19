'use strict';

const java = require('./java-writer');
const path = require('path');
const fs = require('fs');
const utils = require('../../utils');

const requireRegexp = /^goog\.require\(/;

const getTestDir = function(pack) {
  var testDir = 'test';

  if (pack && pack.directories) {
    testDir = pack.directories.test || testDir;
  }

  return testDir;
};

var mocks = {};

const resolver = function(pack, projectDir) {
  if (pack.build) {
    var testDir = getTestDir(pack);
    mocks[pack.name] = path.resolve(projectDir, testDir, '**.mock.js');
  }

  return Promise.resolve();
};

/**
 * Create an index file for test dependencies to be built by webpack.
 * @param {Object} basePackage package.json for the root/base package
 * @param {string} dir The output directory
 * @return {Promise} A promise that resolves when the test index file is created
 */
const createTestIndex = function(basePackage, dir) {
  const testDir = path.resolve(process.cwd(), getTestDir(basePackage));
  if (fs.existsSync(testDir)) {
    const testIndex = path.join(dir, 'index-test.js');

    // find all goog.require statements in tests
    return utils.findLines(requireRegexp, testDir, '**/*.test.js')
      .then(function(list) {
        // create a set of unique goog.require statements
        const results = new Set();

        list.forEach((item) => {
          if (item.lines) {
            item.lines.forEach((line) => results.add(line));
          }
        });

        // resolve them as an array
        return [...results];
      })
      .then(function(list) {
        list.sort();

        // write the list of requires to a file to serve as the webpack entry
        return fs.readFileAsync(path.resolve(__dirname, 'require-all-template.js'), 'utf8')
          .then(function(template) {
            console.log(`Writing ${testIndex} for test library compilation`);
            template = template.replace('// REPLACE', list.join('\n'));
            return fs.writeFileAsync(testIndex, template);
          });
      });
  }

  return Promise.resolve();
};

const _getOptions = function(pack, dir, options) {
  // the compiler options are not defined in camelcase
  /* eslint camelcase: "off" */
  var opts = require('./options-test')();
  opts.js = options.js ? options.js.slice() : [];
  opts.output_manifest = path.join(dir, 'gcc-test-manifest');
  opts.js_output_file = path.join(dir, pack.name + '-test.min.js');
  opts.hide_warnings_for = options.hide_warnings_for ? options.hide_warnings_for.slice() : [];

  for (var key in mocks) {
    opts.js.push(mocks[key]);

    if (key === pack.name) {
      opts.js.push(mocks[key].replace('.mock', '.test'));
    }
  }

  return opts;
};

const writer = function(pack, dir, options) {
  var options = _getOptions(pack, dir, options);
  var jsonOutput = path.join(dir, 'gcc-test-args.json');
  return Promise.all([
    fs.writeFileAsync(jsonOutput, JSON.stringify(options, null, 2)),
    java.genericWriter(pack, dir, options, 'gcc-test-args', true)
  ]);
};

const clear = function() {
  mocks = {};
};

module.exports = {
  clear: clear,
  resolver: resolver,
  postResolver: createTestIndex,
  writer: writer,
  _getOptions: _getOptions
};
