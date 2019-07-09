'use strict';

const Promise = require('bluebird');
const expect = require('chai').expect;
const options = require('../../../plugins/gcc/options');
const fs = Promise.promisifyAll(require('fs'));
const path = require('path');

const getAdditionalPackages = function(dir) {
  return fs.readdirSync(dir)
      .filter(function(file) {
        return /^package-.*\.json$/.test(file);
      }).map(function(file) {
        return require(path.join(dir, file));
      });
};

describe('gcc options resolver', function() {
  afterEach(options.clear);

  var baseDir = path.join(__dirname, 'options');
  var dirs = fs.readdirSync(baseDir);

  dirs.forEach((d) => {
    var dir = path.join(baseDir, d);

    var allPacks = getAdditionalPackages(dir);

    try {
      var pack = require(dir + '/package');
      var expected = require(dir + '/expected');
    } catch (e) {
      console.error('I think you forgot something in ', e);
    }

    allPacks.unshift(pack);

    try {
      var opts = require(dir + '/options');
    } catch (e) {
      opts = {};
    }

    if (expected) {
      var pathKeys = ['js', 'externs', 'output_wrapper_file'];
      var mapPath = (p) => {
        return path.resolve(dir, p);
      };

      pathKeys.forEach((k) => {
        if (expected[k]) {
          expected[k] = expected[k].map(mapPath);
        }
      });
    }

    if (pack) {
      it(d.replace(/-/g, ' '), function() {
        return Promise.map(allPacks, function(curr, idx, arr) {
          return options.resolver(curr, dir, idx);
        }).then(() => {
          options.adder(pack, opts);

          expect(opts).to.deep.equal(expected);
        });
      });
    }
  });
});
