'use strict';

const Promise = require('bluebird');
const expect = require('chai').expect;
const test = require('../../../plugins/gcc/test-writer');
const fs = Promise.promisifyAll(require('fs'));
const rimraf = require('rimraf');
const path = require('path');

describe('gcc test writer', function() {
  var outputDir = path.join(process.cwd(), '.test');
  var file = path.join(outputDir, 'gcc-test-args');

  afterEach(() => {
    test.clear();
    rimraf.sync(file);
  });

  var pack = {
    name: 'thing'
  };

  var getExpected = () => {
    var expected = require('../../../plugins/gcc/options-test');
    expected.output_manifest = 'gcc-test-manifest';
    return expected;
  };


  it('should handle empty options', () => {
    var expected = getExpected();
    expected.js = ['test/**.js'];
    expect(test._getOptions(pack, outputDir, {})).to.deep.equal(expected);
  });

  it('should handle undefined test directories', () => {
    var p = Object.assign(pack, {directories: {}});
    var expected = getExpected();
    expected.js = ['test/**.js'];
    expect(test._getOptions(p, outputDir, {})).to.deep.equal(expected);
  });

  it('should handle explicit test directories', () => {
    var p = Object.assign(pack, {directories: {test: 'foo'}});
    var expected = getExpected();
    expected.js = ['foo/**.js'];
    expect(test._getOptions(p, outputDir, {})).to.deep.equal(expected);
  });

  it('should append test js to source js', () => {
    var expected = getExpected();
    expected.js = ['original.js', 'test/**.js'];
    expect(test._getOptions(pack, outputDir, {
      js: ['origina.js']
    })).to.deep.equal(expected);
  });

  it('should resolve mocks for project dependencies', () => {
    var p = Object.assign(pack, {build: {}});
    var p2 = {
      name: 'dependency',
      build: {
      }
    };

    return test.resolver(p, '')
      .then(() => {
        return test.resolver(p2, '../dependency');
      })
      .then(() => {
        var expected = getExpected();
        expected.js = ['test/**.js', 'test/**.mock.js', '../dependency/test/**mock.js'];
        expect(test._getOptions(p, outputDir, {})).to.deep.equal(expected);
      });
  });

  it('should not resolve mocks for non-build project dependencies', () => {
    var p = Object.assign(pack, {build: {}});
    var p2 = {
      name: 'dependency'
    };

    return test.resolver(p, '')
      .then(() => {
        return test.resolver(p2, '../dependency');
      })
      .then(() => {
        var expected = getExpected();
        expected.js = ['test/**.js'],
        expect(test._getOptions(p, outputDir, {})).to.deep.equal(expected);
      });
  });

  it('should write the test args file to the output directory', () => {
    return test.writer(pack, outputDir, {}).then(() => {
      return expect(fs.existsSync(file)).to.be.true;
    });
  });
});
