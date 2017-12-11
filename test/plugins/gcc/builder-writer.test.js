'use strict';

const Promise = require('bluebird');
const expect = require('chai').expect;
const builder = require('../../../plugins/gcc/builder-writer');
const fs = Promise.promisifyAll(require('fs'));
const rimraf = require('rimraf');
const path = require('path');

describe('gcc builder writer', function() {
  var outputDir = path.join(process.cwd(), '.test');
  var file = path.join(outputDir, 'gcb-python-args');

  afterEach(() => {
    rimraf.sync(file);
  });

  var pack = {
    name: 'thing'
  };

  it('should handle undefined options', () => {
    return builder.writer(pack, outputDir)
      .then(() => {
        return fs.readFileAsync(file, 'utf-8');
      })
      .then(content => {
        expect(content).to.equal('');
      });
  });

  it('should handle empty options', () => {
    return builder.writer(pack, outputDir, {})
      .then(() => {
        return fs.readFileAsync(file, 'utf-8');
      })
      .then(content => {
        expect(content).to.equal('');
      });
  });

  it('should handle source files', () => {
    return builder.writer(pack, outputDir, {
      js: [
        'src/**.js',
        'lib/**.js',
        '!src/notme.js'
      ]
    })
      .then(() => {
        return fs.readFileAsync(file, 'utf-8');
      })
      .then(content => {
        expect(content).to.equal('--root=src --root=lib');
      });
  });

  it('should handle entry points', () => {
    return builder.writer(pack, outputDir, {
      entry_point: [
        'goog:libcomp',
        'goog:main'
      ]
    })
      .then(() => {
        return fs.readFileAsync(file, 'utf-8');
      })
      .then(content => {
        expect(content).to.equal('--namespace=libcomp --namespace=main');
      });
  });

  it('should handle a single entry point', () => {
    return builder.writer(pack, outputDir, {
      entry_point: 'goog:libcomp'
    })
      .then(() => {
        return fs.readFileAsync(file, 'utf-8');
      })
      .then(content => {
        expect(content).to.equal('--namespace=libcomp');
      });
  });

  it('should ignore other options', () => {
    return builder.writer(pack, outputDir, {
      compilation_level: 'simple',
      jscomp_warning: 'yermom'
    })
      .then(() => {
        return fs.readFileAsync(file, 'utf-8');
      })
      .then(content => {
        expect(content).to.equal('');
      });
  });
});
