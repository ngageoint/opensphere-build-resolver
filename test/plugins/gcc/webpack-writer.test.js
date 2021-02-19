'use strict';

const Promise = require('bluebird');
const expect = require('chai').expect;
const fs = Promise.promisifyAll(require('fs'));
const webpack = require('../../../plugins/gcc/webpack-writer');
const rimraf = require('rimraf');
const path = require('path');

describe('gcc webpack writer', function() {
  var outputDir = path.join(process.cwd(), '.test');

  var indexFile = path.join(outputDir, 'index.js');
  var optionsFile = path.join(outputDir, 'gcc-webpack.json');

  afterEach(() => {
    rimraf.sync(indexFile);
    rimraf.sync(optionsFile);
  });

  var pack = {
    name: 'thing'
  };

  var writeFn = (pack, dir, options) => {
    return webpack.writer(pack, dir, options);
  };

  it('should throw on missing entry_point', function() {
    expect(writeFn.bind(undefined, pack, outputDir, {})).to.throw();
    expect(writeFn.bind(undefined, pack, outputDir, {entry_point: ''})).to.throw();
    expect(writeFn.bind(undefined, pack, outputDir, {entry_point: []})).to.throw();
  });

  it('should handle empty options', function() {
    return webpack.writer(pack, outputDir, {
      entry_point: ['goog:ns']
    })
      .then(() => {
        return fs.readFileAsync(optionsFile, 'utf-8');
      })
      .then((content) => {
        expect(content).to.exist;
      });
  });

  it('should write options to a file', function() {
    var jsonOptions = {
      angular_pass: true,
      compilation_level: 'simple',
      entry_point: ['goog:ns'],
      jscomp_error: 'accessControls',
      jscomp_off: 'es6',
      jscomp_warning: 'deprecated'
    };

    var expectedOptions = {
      angular_pass: true,
      compilation_level: 'simple',
      jscomp_error: 'accessControls',
      jscomp_off: 'es6',
      jscomp_warning: 'deprecated'
    };

    return webpack.writer(pack, outputDir, jsonOptions)
      .then(() => {
        return fs.readFileAsync(optionsFile, 'utf-8');
      })
      .then((content) => {
        expect(content).to.equal(JSON.stringify(expectedOptions, null, 2));
      });
  });

  it('should remove options handled by webpack', function() {
    var jsonOptions = {
      compilation_level: 'advanced',
      create_source_map: 'test',
      dependency_mode: 'test',
      entry_point: 'goog:ns',
      js: ['a.js', 'b.js'],
      js_output_file: 'test',
      module: 'test',
      module_resolution: 'test',
      output_manifest: 'test',
      output_wrapper: 'test'
    };

    var expectedOptions = {
      compilation_level: 'advanced',
      output_manifest: 'test'
    };

    return webpack.writer(pack, outputDir, jsonOptions)
      .then(() => {
        return fs.readFileAsync(optionsFile, 'utf-8');
      })
      .then((content) => {
        expect(content).to.equal(JSON.stringify(expectedOptions, null, 2));
      });
  });

  it('should write index to a file', function() {
    var jsonOptions = {
      entry_point: ['goog:ns1', 'goog:ns2']
    };

    var expectedContent = `goog.require('ns1');\ngoog.require('ns2');`;

    return webpack.writer(pack, outputDir, jsonOptions)
      .then(() => {
        return fs.readFileAsync(indexFile, 'utf-8');
      })
      .then((content) => {
        expect(content).to.equal(expectedContent);
      });
  });
});
