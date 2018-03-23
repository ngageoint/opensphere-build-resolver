'use strict';

const Promise = require('bluebird');
const fs = Promise.promisifyAll(require('fs'));
const path = require('path');
const expect = require('chai').expect;
const externs = require('../../../plugins/gcc/externs');

describe('gcc externs resolver', function() {
  afterEach(externs.clear);

  var baseDir = path.join(__dirname, 'externs');
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
        return externs.resolver(pack, dir).then(() => {
          var options = {};
          externs.adder(pack, options);

          var result = options.externs.map(getMapLocalPath(dir));
          expect(result.length).to.equal(expected.length);
          expected.forEach((x) => {
            expect(result).to.contain(x);
          });
        });
      });
    }
  });
});
