'use strict';

const Promise = require('bluebird');
const fs = Promise.promisifyAll(require('fs'));
const path = require('path');
const expect = require('chai').expect;
const resources = require('../../../plugins/resources');
const rimraf = require('rimraf');

describe('resources resolver', () => {
  afterEach(() => {
    resources.clear();
    rimraf.sync(path.join(outputDir, '*'));
  });

  var outputDir = path.join(process.cwd(), '.test');
  var baseDir = path.join(__dirname, 'resources');
  var dirs = fs.readdirSync(baseDir);

  var check = (dir) => {
    var expectedDir = path.join(dir, 'expected');
    var files = [
      'resources-copy-dirs',
      'resources-copy-files',
      'resources-css-debug-index',
      'resources-css-dist-index',
      'resources-js-debug-index',
      'resources-js-dist-index',
      'resources-pages'];

    files.forEach((file) => {
      var expectedPath = path.join(expectedDir, file);

      if (fs.existsSync(expectedPath)) {
        var expectedFile = fs.readFileSync(expectedPath, 'utf-8').trim();

        if (expectedFile) {
          var outputPath = path.join(outputDir, file);
          expect(fs.existsSync(outputPath)).to.equal(true);

          var outputFile = fs.readFileSync(outputPath, 'utf-8').trim();

          // replace paths
          var r1 = new RegExp(process.cwd() + path.sep, 'g');
          var r2 = new RegExp(dir + path.sep, 'g');

          outputFile = outputFile.replace(r2, '');
          outputFile = outputFile.replace(r1, '');

          expect(outputFile).to.equal(expectedFile);
        }
      }
    });
  };

  dirs.forEach((d) => {
    var dir = path.join(baseDir, d);
    var pack = null;

    try {
      pack = require(dir + '/package');
    } catch (e) {
      console.error(e);
    }

    if (pack) {
      it(d.replace(/-/g, ' '), () => {
        return resources.resolver(pack, dir, pack.depth || 0)
          .then(() => {
            return resources.writer(pack, outputDir);
          })
          .then(() => {
            check(dir);
          });
      });
    }
  });

  it('should not resolve plugins of packages other than the base package', () => {
    var base = {
      name: 'base',
      build: {
        type: 'app'
      }
    };

    var other = {
      name: 'other-plugin-thing',
      build: {
        type: 'plugin',
        index: 'thing.js'
      }
    };

    return resources.resolver(base, path.join(baseDir, 'should-gracefuly-handle-missing-index'), 1)
      .then(() => {
        resources.resolver(other, path.join(baseDir, 'should-find-and-parse-index-files'), 2);
      })
      .then(() => {
        resources.writer(base, outputDir);
      }).then(() => {
        var files = fs.readdirSync(outputDir);
        expect(files.length).to.equal(0);
      });
  });
});
