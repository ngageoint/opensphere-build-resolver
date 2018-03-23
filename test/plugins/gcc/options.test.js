'use strict';

const Promise = require('bluebird');
const expect = require('chai').expect;
const options = require('../../../plugins/gcc/options');
const fs = Promise.promisifyAll(require('fs'));
const path = require('path');

describe('gcc options resolver', function() {
  afterEach(options.clear);

  var baseDir = path.join(__dirname, 'options');
  var dirs = fs.readdirSync(baseDir);

  dirs.forEach((d) => {
    var dir = path.join(baseDir, d);

    try {
      var pack = require(dir + '/package');
      var expected = require(dir + '/expected');
    } catch (e) {
      console.error('I think you forgot something in ', e);
    }

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
        return options.resolver(pack, dir).then(() => {
          options.adder(pack, opts);

          expect(opts).to.deep.equal(expected);
        });
      });
    }
  });
});
