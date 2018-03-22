'use strict';

const Promise = require('bluebird');
const fs = Promise.promisifyAll(require('fs'));
const path = require('path');
const expect = require('chai').expect;
const scss = require('../../../plugins/scss');
const rimraf = require('rimraf');

describe('scss resolver', () => {
  afterEach(() => {
    scss.clear();
    rimraf.sync(path.join(outputDir, '*'));
  });

  var outputDir = path.join(process.cwd(), '.test');
  var baseDir = path.join(__dirname, 'scss');
  var dirs = fs.readdirSync(baseDir);

  dirs.forEach((d) => {
    var dir = path.join(baseDir, d);

    try {
      var pack = require(dir + '/package');
    } catch (e) {
      console.error(e);
    }

    if (pack) {
      it(d.replace(/-/g, ' '), () => {
        return scss.resolver(pack, dir, 0)
          .then(() => {
            return scss.postResolver(pack, outputDir);
          })
          .then(() => {
            return scss.writer(pack, outputDir);
          })
          .then(() => {
            var file1 = path.join(outputDir, 'node-sass-args');
            var file2 = path.join(outputDir, 'require-all.scss');

            var expectedArgs = fs.readFileSync(path.join(dir, 'node-sass-args'), 'utf-8').trim();
            var expectedRequireAll = fs.readFileSync(path.join(dir, 'require-all.scss'), 'utf-8').trim();

            expect(fs.existsSync(file1)).to.equal(Boolean(expectedArgs));
            expect(fs.existsSync(file2)).to.equal(Boolean(expectedRequireAll));

            if (expectedArgs && expectedRequireAll) {
              var args = fs.readFileSync(file1, 'utf-8');
              args = args.replace(new RegExp(outputDir + path.sep, 'g'), '');
              args = args.replace(new RegExp(dir + path.sep, 'g'), '');

              var requireAll = fs.readFileSync(file2, 'utf-8');

              expect(args).to.equal(expectedArgs);
              expect(requireAll).to.equal(expectedRequireAll);
            }
          });
      });
    }
  });
});
