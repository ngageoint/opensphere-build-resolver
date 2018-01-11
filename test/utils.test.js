'use strict';

const utils = require('../utils');
const expect = require('chai').expect;
const path = require('path');

describe('utils', () => {
  it('should detect app packages', () => {
    var pack = {
      name: 'something',
      build: {type: 'app'}
    };

    expect(utils.isAppPackage(pack)).to.be.true;
  });

  it('should not detect app packages as any other type', () => {
    var others = ['config', 'plugin', 'lib', null, undefined, 1];
    var pack = {
      name: 'something',
      build: {}
    };

    others.forEach((item) => {
      pack.build.type = item;
      expect(utils.isAppPackage(pack)).to.be.false;
    });
  });

  it('should detect config packages', () => {
    var pack = {
      name: 'something',
      build: {type: 'config'}
    };

    expect(utils.isConfigPackage(pack)).to.be.true;
  });

  it('should not detect config packages as any other type', () => {
    var others = ['app', 'plugin', 'lib', null, undefined, 1];
    var pack = {
      name: 'something',
      build: {}
    };

    others.forEach((item) => {
      pack.build.type = item;
      expect(utils.isConfigPackage(pack)).to.be.false;
    });
  });

  it('should detect plugin packages', () => {
    var pack = {
      name: 'something',
      build: {type: 'plugin'}
    };

    expect(utils.isPluginPackage(pack)).to.be.true;
  });

  it('should not detect plugin packages as any other type', () => {
    var others = ['config', 'app', 'lib', null, undefined, 1];
    var pack = {
      name: 'something',
      build: {}
    };

    others.forEach((item) => {
      pack.build.type = item;
      expect(utils.isPluginPackage(pack)).to.be.false;
    });
  });

  it('should check whether or not is a plugin of another package', () => {
    var base = {
      name: 'parent',
      build: {
        type: 'app'
      }
    };

    var plugin = {
      name: 'parent-ext',
      build: {
        type: 'plugin'
      }
    };

    var other = {
      name: 'other',
      build: {
        type: 'plugin'
      }
    };

    expect(utils.isPluginOfPackage(base, plugin)).to.be.true;
    expect(utils.isPluginOfPackage(plugin, base)).to.be.false;
    expect(utils.isPluginOfPackage(base, other)).to.be.false;
  });

  it('should get a priority sort in ascending order', () => {
    var map = {
      'two': 2,
      'three': 3,
      'one': 1,
      'default': null,
      'first': -10,
      'last': 10
    };

    var keys = Object.keys(map);
    var sort = utils.getPrioritySort(map);
    keys.sort(sort);

    var expected = ['first', 'default', 'one', 'two', 'three', 'last'];
    expect(keys.length).to.equal(expected.length);

    for (var i = 0; i < keys.length; i++) {
      expect(keys[i]).to.equal(expected[i]);
    }
  });

  it('should get indents for console output', () => {
    expect(utils.getIndent(0)).to.equal('');
    expect(utils.getIndent(1)).to.equal(' \u221F ');
    expect(utils.getIndent(2)).to.equal('   \u221F ');
    expect(utils.getIndent(3)).to.equal('     \u221F ');
  });

  it('should get the package for a module', () => {
    expect(utils.getPackage('not-a-real-package')).to.be.undefined;

    var pack = utils.getPackage('chai');
    expect(pack).not.to.be.undefined;
    expect(pack.name).to.equal('chai');
  });

  it('should get the path for a module', () => {
    expect(utils.resolveModulePath('not-a-real-package')).to.be.undefined;

    var chaiPath = utils.resolveModulePath('chai');
    expect(chaiPath).to.exist;

    var chaiJsPath = utils.resolveModulePath(path.join('chai', 'lib', 'chai.js'));
    expect(chaiJsPath).to.equal(path.join(chaiPath, 'lib', 'chai.js'));
  });
});
