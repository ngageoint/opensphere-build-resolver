'use strict';

const Promise = require('bluebird');
const fs = Promise.promisifyAll(require('fs'));
const path = require('path');
const expect = require('chai').expect;
const electron = require('../../../plugins/electron');
const rimraf = require('rimraf');
const utils = require('../../../utils.js');

describe('electron resolver', () => {
  afterEach(() => {
    electron.clear();
    rimraf.sync(path.join(outputDir, '*'));
  });

  var outputDir = path.join(process.cwd(), '.test');
  var baseDir = path.join(__dirname, 'electron');
  var dirs = fs.readdirSync(baseDir);

  dirs.forEach((d) => {
    var dir = path.join(baseDir, d, 'project');

    try {
      var pack = require(dir + '/package');
    } catch (e) {
      console.error(e);
    }

    if (pack) {
      it(d.replace(/-/g, ' '), () => {
        return electron.resolver(pack, dir, 0)
          .then(() => {
            // mock this to just find the sibling directories
            var old = utils.resolveModulePath;
            utils.resolveModulePath = (p) => {
              return path.join(baseDir, d, p);
            };

            var promise = electron.writer(pack, outputDir);

            // put it back
            utils.resolveModulePath = old;
            return promise;
          })
          .finally(() => {
            try {
              var expected = require(path.join(baseDir, d, 'expected'));
            } catch (e) {
              expected = false;
            }

            try {
              var generatedAppPack = require(path.join(baseDir, d, 'opensphere-electron', 'app', 'package'));
            } catch (e) {
              generatedAppPack = false;
            }

            expect(generatedAppPack).to.deep.equal(expected);

            if (pack.build && pack.build.electron && pack.build.electron.preload) {
              var scriptDir = path.join(baseDir, d, 'opensphere-electron', 'app', 'src', 'preload');
              var scripts = fs.readdirSync(scriptDir);
              expect(scripts.length).to.equal(pack.build.electron.preload.length);
            }
          });
      });
    }
  });
});
