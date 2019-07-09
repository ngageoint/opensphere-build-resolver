'use strict';

const Promise = require('bluebird');
const fs = Promise.promisifyAll(require('fs'));
const path = require('path');
const expect = require('chai').expect;
const config = require('../../../plugins/config');
const rimraf = require('rimraf');

describe('config resolver', () => {
  afterEach(() => {
    config.clear();
    rimraf.sync(path.join(outputDir, '*'));
  });

  var outputDir = path.join(process.cwd(), '.test');
  var baseDir = path.join(__dirname, 'config');
  var dirs = fs.readdirSync(baseDir);

  var getMapLocalPath = (dir) => {
    return (d) => {
      d = d.replace(new RegExp('.*' + dir + path.sep), '');
      return d.replace(/\//g, path.sep);
    };
  };

  dirs.forEach((d) => {
    var dir = path.join(baseDir, d);

    try {
      var pack = require(dir + '/package');
      var expected = require(dir + '/expected');
      var expectedDebug = require(dir + '/expected-debug');
    } catch (e) {
      console.error(e);
    }

    if (pack) {
      it(d.replace(/-/g, ' '), () => {
        return config.resolver(pack, dir, 0)
            .then(() => {
              return config.writer(pack, outputDir);
            })
            .then(() => {
              var file1 = path.join(outputDir, 'settings.json');
              var file2 = path.join(outputDir, 'settings-debug.json');

              expect(fs.existsSync(file1)).to.equal(Boolean(expected));
              expect(fs.existsSync(file2)).to.equal(Boolean(expectedDebug));

              if (expected && expectedDebug) {
                var settings = JSON.parse(fs.readFileSync(file1, 'utf-8'));
                var debug = JSON.parse(fs.readFileSync(file2, 'utf-8'));

                expect(settings).to.deep.equal(expected);

                debug.overrides = debug.overrides.map(getMapLocalPath(d));
                expect(debug).to.deep.equal(expectedDebug);
              }
            });
      });
    }
  });
});
