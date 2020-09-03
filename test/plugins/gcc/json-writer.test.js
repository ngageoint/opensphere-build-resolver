'use strict';

const Promise = require('bluebird');
const expect = require('chai').expect;
const fs = Promise.promisifyAll(require('fs'));
const json = require('../../../plugins/gcc/json-writer');
const rimraf = require('rimraf');
const path = require('path');

describe('gcc json writer', function() {
  var outputDir = path.join(process.cwd(), '.test');
  var file = path.join(outputDir, 'gcc-args.json');

  afterEach(() => {
    rimraf.sync(file);
  });

  var pack = {
    name: 'thing'
  };

  it('should handle empty options', function() {
    return json.writer(pack, outputDir, {})
      .then(() => {
        return fs.readFileAsync(file, 'utf-8');
      })
      .then((content) => {
        expect(content).to.exist;
      });
  });

  it('should write options to a file', function() {
    var jsonOptions = {
      angular_pass: true,
      compilation_level: 'simple',
      js: ['a.js', 'b.js'],
      jscomp_error: 'accessControls',
      jscomp_off: 'es6',
      jscomp_warning: 'useOfGoogBase'
    };

    return json.writer(pack, outputDir, jsonOptions)
      .then(() => {
        return fs.readFileAsync(file, 'utf-8');
      })
      .then((content) => {
        expect(content).to.equal(JSON.stringify(jsonOptions, null, 2));
      });
  });
});
