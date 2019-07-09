'use strict';

const Promise = require('bluebird');
const expect = require('chai').expect;
const java = require('../../../plugins/gcc/java-writer');
const fs = Promise.promisifyAll(require('fs'));
const rimraf = require('rimraf');
const path = require('path');

describe('gcc java writer', function() {
  var outputDir = path.join(process.cwd(), '.test');
  var file = path.join(outputDir, 'gcc-java-args');

  afterEach(() => {
    rimraf.sync(file);
  });

  var pack = {
    name: 'thing'
  };

  it('should handle empty options', function() {
    return java.writer(pack, outputDir, {})
        .then(() => {
          return fs.readFileAsync(file, 'utf-8');
        })
        .then((content) => {
          expect(content).to.equal('');
        });
  });

  it('should handle keys properly', function() {
    return java.writer(pack, outputDir, {
      angular_pass: true,
      compilation_level: 'simple',
      js: ['a.js', 'b.js'],
      jscomp_error: 'accessControls',
      jscomp_off: 'es6',
      jscomp_warning: 'useOfGoogBase'
    })
        .then(() => {
          return fs.readFileAsync(file, 'utf-8');
        })
        .then((content) => {
          expect(content).to.contain('--angular_pass');
          expect(content).not.to.contain('--angular_pass true');
          expect(content).to.contain('--compilation_level simple');
          expect(content).to.contain('--js=\'a.js\'');
          expect(content).to.contain('--js=\'b.js\'');
          expect(content).to.contain('--jscomp_error=\'accessControls\'');
          expect(content).to.contain('--jscomp_off=\'es6\'');
          expect(content).to.contain('--jscomp_warning=\'useOfGoogBase\'');
        });
  });
});
