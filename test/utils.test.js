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

  it('should get the path for a scoped module', () => {
    expect(utils.resolveModulePath('@some-scope/not-a-real-package')).to.be.undefined;

    var modulePath = utils.resolveModulePath('@semantic-release/changelog');
    expect(modulePath).to.exist;

    var indexPath = utils.resolveModulePath('@semantic-release/changelog/index.js');
    expect(indexPath).to.equal(path.join(modulePath, 'index.js'));
  });

  it('should get the path for a module with win32-like paths', ()=> {
    var chaiPath = utils.resolveModulePath('@semantic-release\\changelog\\index.js');
    expect(chaiPath).to.exist;
  });

  it('should find matching lines in a directory', () => {
    var directory = path.join(__dirname, 'utils-find-lines');
    return utils.findLines(/^goog\.provide\(/, directory).then((matches) => {
      expect(matches.length).to.equal(2);
      expect(matches.reduce((total, match) => total + match.lines.length, 0)).to.equal(4);
    });
  });

  it('should find matching lines in a directory with a file pattern', () => {
    var directory = path.join(__dirname, 'utils-find-lines');
    return utils.findLines(/^goog\.provide\(/, directory, /\.js$/).then((matches) => {
      expect(matches.length).to.equal(1);
      expect(matches.reduce((total, match) => total + match.lines.length, 0)).to.equal(2);
    });
  });

  it('should get the correct group for each project', function() {
    expect(utils.getGroup(['project'])).to.equal(utils.Groups.BASE);
    expect(utils.getGroup(['project', 'project-plugin-test'])).to.equal(utils.Groups.PLUGIN);
    expect(utils.getGroup(['project', 'project-config-test'])).to.equal(utils.Groups.CONFIG);
    expect(utils.getGroup(['project', 'project-plugin-test-config-test'])).to.equal(utils.Groups.CONFIG);
  });

  it('should prefer explicit priority', function() {
    const list = [
      {priority: -1, name: 'project', depth: 0, group: utils.Groups.BASE},
      {priority: -2, name: 'project-plugin-foo', depth: 1, group: utils.Groups.PLUGIN},
      {priority: -3, name: 'project-plugin-bar', depth: 1, group: utils.Groups.PLUGIN},
      {priority: -4, name: 'project-config-test', depth: 1, group: utils.Groups.CONFIG},
      {priority: -5, name: 'project-plugin-bar-config-test', depth: 2, group: utils.Groups.CONFIG}
    ];

    list.sort(utils.priorityGroupDepthSort);

    expect(list.map((n) => n.name)).to.deep.equal([
      'project-plugin-bar-config-test', 'project-config-test', 'project-plugin-bar',
      'project-plugin-foo', 'project']);
  });

  describe('group and depth updater', function() {
    it('should only handle items with the same name', function() {
      const list = [
        {name: 'some other name', depth: 0, group: utils.Groups.BASE}
      ];

      const updater = utils.getGroupDepthUpdater(list);
      updater({name: 'test'}, 0, ['test']);

      expect(list[0].depth).to.equal(0);
      expect(list[0].group).to.equal(utils.Groups.BASE);
    });

    it('should not update for groups greater than the current one', function() {
      const list = [
        {name: 'project', depth: 0, group: utils.Groups.BASE},
        {name: 'project-plugin-test', depth: 1, group: utils.Groups.PLUGIN},
        {name: 'project-config-test', depth: 1, group: utils.Groups.CONFIG}
      ];

      const updater = utils.getGroupDepthUpdater(list);

      updater({name: 'project'}, 2, ['project', 'project-plugin-test', 'project']);
      expect(list[0].depth).to.equal(0);
      expect(list[0].group).to.equal(utils.Groups.BASE);

      updater({name: 'project-plugin-test'}, 2, ['project', 'project-config-test', 'project-plugin-test']);
      expect(list[1].depth).to.equal(1);
      expect(list[1].group).to.equal(utils.Groups.PLUGIN);
    });

    it('should upgrade groups', function() {
      const list = [
        {name: 'lib', depth: 3, group: utils.Groups.PLUGIN}
      ];

      const updater = utils.getGroupDepthUpdater(list);

      updater({name: 'lib'}, 1, ['project', 'lib']);
      expect(list[0].depth).to.equal(1);
      expect(list[0].group).to.equal(utils.Groups.BASE);
    });

    it('should use the maximum depth within a group', function() {
      const list = [
        {name: 'lib', depth: 1, group: utils.Groups.BASE}
      ];

      const updater = utils.getGroupDepthUpdater(list);

      updater({name: 'lib'}, 2, ['project', 'other-lib', 'lib']);
      expect(list[0].depth).to.equal(2);
      expect(list[0].group).to.equal(utils.Groups.BASE);
    });
  });
});
