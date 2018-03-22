'use strict';

const Promise = require('bluebird');
const expect = require('chai').expect;
const src = require('../../../plugins/gcc/src');
const fs = Promise.promisifyAll(require('fs'));
const rimraf = require('rimraf');
const path = require('path');

describe('gcc src resolver', function() {
  afterEach(function() {
    // reset the source list between tests
    src.clear();

    // clean up the output file
    rimraf.sync(path.join(outputDir, 'require-all.js'));
  });

  var outputDir = path.join(process.cwd(), '.test');
  var baseDir = path.join(__dirname, 'src');
  var dirs = fs.readdirSync(baseDir);

  var getMapLocalPath = (dir) => {
    return (d) => {
      return d.replace(dir + path.sep, '');
    };
  };

  var mapExpected = (p) => {
    return p.join(path.sep);
  };

  dirs.forEach((d) => {
    var dir = path.join(baseDir, d);

    try {
      var pack = require(dir + '/package');
      var expected = require(dir + '/expected').map(mapExpected);
    } catch (e) {
      console.log('skipping ' + d);
    }

    if (pack && expected) {
      it(d.replace(/-/g, ' '), function() {
        return src.resolver(pack, dir).then(() => {
          var options = {};
          src.adder(pack, options);

          var result = options.js.map(getMapLocalPath(dir));
          expect(result.length).to.equal(expected.length);
          expected.forEach((x) => {
            expect(result).to.contain(x);
          });
        });
      });
    }
  });

  it('should not create a require-all.js file for apps', function() {
    // for now we'll just appropriate a directory from another test
    var dir = path.join(baseDir, 'should-find-explicitly-defined-src-directories');
    var pack = require(dir + '/package');

    return src.postResolver(pack, outputDir)
      .then(() => {
        expect(fs.existsSync(path.join(outputDir, 'require-all.js'))).to.be.false;
      });
  });

  it('should create a require-all.js file for libs', function() {
    // for now we'll just appropriate a directory from another test
    var dir = path.join(baseDir, 'should-magically-find-lib-and-src-directories');
    var pack = require(dir + '/package');
    var lastDir = process.cwd();
    process.chdir(dir);

    return src.resolver(pack, dir)
      .then(() => {
        return src.postResolver(pack, outputDir);
      })
      .then(() => {
        process.chdir(lastDir);

        var file = path.join(outputDir, 'require-all.js');
        expect(fs.existsSync(file)).to.be.true;

        // if the require-all file was written, then it should also be added to the src paths
        var options = {};
        src.adder(null, options);
        expect(options.js.length).to.equal(3);
        expect(options.js).to.contain(file);

        return fs.readFileAsync(file, 'utf-8');
      })
      .then((content) => {
        // both files are required
        expect(content).to.contain('goog.require(\'app\')');
        expect(content).to.contain('goog.require(\'util\')');

        // and they are sorted
        expect(content.indexOf('goog.require(\'app\')')).to.be.lessThan(content.indexOf('goog.require(\'util\')'));
      });
  });
});
