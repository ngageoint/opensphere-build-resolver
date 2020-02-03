'use strict';

const java = require('./java-writer');
const path = require('path');
const fs = require('fs');

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
  writer: writer,
  _getOptions: _getOptions
};
