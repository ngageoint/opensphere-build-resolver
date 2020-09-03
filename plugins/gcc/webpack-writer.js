'use strict';

const Promise = require('bluebird');
const fs = Promise.promisifyAll(require('fs'));
const path = require('path');

/**
 * Properties written by closure-webpack-plugin that should be omitted from the output.
 * @type {!Array<string>}
 */
const closureWebpackInternalProps = [
  'create_source_map',
  'dependency_mode',
  'entry_point',
  'js',
  'js_output_file',
  'module',
  'module_resolution',
  'output_manifest',
  'output_wrapper'
];

/**
 * Write support files for webpack.
 * @param {Object} basePackage The base package.
 * @param {string} dir The output directory.
 * @param {Object} options The Closure Compiler options.
 * @return {Promise} Promise that resolves when all files have been written.
 */
const writer = function(basePackage, dir, options) {
  const promises = [];

  //
  // Translate the entry_point list into a webpack entry file.
  //
  let entryPoints = options.entry_point;
  if (entryPoints && !Array.isArray(entryPoints)) {
    entryPoints = [entryPoints];
  }

  if (entryPoints && entryPoints.length) {
    const entryPoints = Array.isArray(options.entry_point) ? options.entry_point : [options.entry_point];
    const indexContent = entryPoints
      .map((ep) => `goog.require('${ep.replace(/^goog:/, '')}');`)
      .join('\n');

    const indexFile = path.join(dir, 'index.js');
    console.log('Writing ' + indexFile);
    promises.push(fs.writeFileAsync(indexFile, indexContent));
  } else {
    throw new Error(`No entry_point defined in GCC options for ${basePackage.name}`);
  }

  //
  // Generate Closure Compiler options for webpack.
  //
  const webpackOptions = Object.assign({}, options);
  closureWebpackInternalProps.forEach((prop) => {
    delete webpackOptions[prop];
  });

  const outputfile = path.join(dir, 'gcc-webpack.json');
  console.log('Writing ' + outputfile);
  promises.push(fs.writeFileAsync(outputfile, JSON.stringify(webpackOptions, null, 2)));

  return Promise.all(promises);
};

module.exports = {
  writer: writer
};
