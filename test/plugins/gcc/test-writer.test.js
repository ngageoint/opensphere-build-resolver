'use strict';

const Promise = require('bluebird');
const expect = require('chai').expect;
const test = require('../../../plugins/gcc/test-writer');
const fs = Promise.promisifyAll(require('fs'));
const rimraf = require('rimraf');
const path = require('path');

describe('gcc test writer', function() {
  var projectDir = process.cwd();
  var outputDir = path.join(process.cwd(), '.test');
  var file = path.join(outputDir, 'gcc-test-args');

  afterEach(() => {
    test.clear();
    rimraf.sync(file);
  });

  var hideWarningsFor = [
    '/a-thing/',
    '/another-thing/'
  ];

  var pack = {
    name: 'thing'
  };

  var getExpected = () => {
    var expected = require('../../../plugins/gcc/options-test')();
    expected.js = [];
    expected.output_manifest = mapOutputDir('gcc-test-manifest');
    expected.js_output_file = mapOutputDir(pack.name + '-test.min.js');
    expected.hide_warnings_for = [];
    return expected;
  };

  var mapProjectDir = (dir) => path.join(projectDir, dir);

  var mapOutputDir = (dir) => path.join(outputDir, dir);

  it('should handle empty options', () => {
    var expected = getExpected();
    expect(test._getOptions(pack, outputDir, {})).to.deep.equal(expected);
  });

  it('should handle undefined test directories', () => {
    var p = Object.assign(pack, {directories: {}});
    var expected = getExpected();
    expect(test._getOptions(p, outputDir, {})).to.deep.equal(expected);
  });

  it('should handle explicit test directories', () => {
    var p = Object.assign(pack, {
      directories: {
        test: 'foo'
      },
      build: {}
    });

    var expected = getExpected();
    expected.js = ['foo/**.mock.js', 'foo/**.test.js'].map(mapProjectDir);

    return test.resolver(p, '').then(() => {
      expect(test._getOptions(p, outputDir, {})).to.deep.equal(expected);
    });
  });

  it('should append test js to source js', () => {
    var expected = getExpected();
    expected.js = ['original.js'];
    expect(test._getOptions(pack, outputDir, {
      js: ['original.js']
    })).to.deep.equal(expected);
  });

  it('should add hide_warnings_for to options', () => {
    var expected = getExpected();
    expected.hide_warnings_for = hideWarningsFor;
    var result = test._getOptions(pack, outputDir, {
      hide_warnings_for: hideWarningsFor
    });
    expect(result).to.deep.equal(expected);
  });

  it('should resolve mocks for project dependencies', () => {
    var p = Object.assign(pack, {
      build: {},
      directories: {}
    });
    var p2 = {
      name: 'dependency',
      build: {}
    };

    return test.resolver(p, '')
      .then(() => {
        return test.resolver(p2, '../dependency');
      })
      .then(() => {
        var expected = getExpected();
        expected.js = ['test/**.mock.js', 'test/**.test.js', '../dependency/test/**.mock.js'].map(mapProjectDir);
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
        expected.js = ['test/**.mock.js', 'test/**.test.js'].map(mapProjectDir),
        expect(test._getOptions(p, outputDir, {})).to.deep.equal(expected);
      });
  });

  it('should write the test args file to the output directory', () => {
    return test.writer(pack, outputDir, {}).then(() => {
      return expect(fs.existsSync(file)).to.be.true;
    });
  });
});
