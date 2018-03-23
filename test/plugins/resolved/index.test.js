'use strict';

const Promise = require('bluebird');
const path = require('path');
const expect = require('chai').expect;
const resolved = require('../../../plugins/resolved');
const rimraf = require('rimraf');

describe('resolved resolver', () => {
  afterEach(() => {
    resolved.clear();
    rimraf.sync(path.join(outputDir, '*'));
  });

  var outputDir = path.join(process.cwd(), '.test');
  var expected = require('./expected');

  it('should keep track of resolved locations', () => {
    var dirs = [
      'base',
      'base/modules/dep',
      'base/modules/devDep',
      'base-plugin',
      'base-plugin',
      'base-config'
    ];

    return Promise.map(dirs, (dir) => {
      var pack = require(path.join(__dirname, dir, 'package'));
      return resolved.resolver(pack, dir);
    }).then(() => {
      return resolved.writer({}, outputDir);
    }).then(() => {
      var fixPaths = (thing) => {
        for (var key in thing) {
          thing[key] = thing[key].replace(__dirname, '');
        }
      };

      var result = require(path.join(outputDir, 'resolved'));

      fixPaths(result);
      expect(result).to.deep.equal(expected);
    });
  });
});
