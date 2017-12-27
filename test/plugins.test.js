'use strict';

const pluginUtils = require('../plugins');
const expect = require('chai').expect;
const path = require('path');
const fs = require('fs');
const mkdirp = require('mkdirp');
const rimraf = require('rimraf');

describe('plugins', () => {
  it('should pick up included plugins', () => {
    const plugins = pluginUtils.load();

    var expectedPlugins = [
      require('../plugins/config'),
      require('../plugins/copy-views'),
      require('../plugins/gcc'),
      require('../plugins/resolved'),
      require('../plugins/resources'),
      require('../plugins/scss')];

    expectedPlugins.forEach((p) => {
      if (p.resolver) {
        expect(plugins.resolvers).to.contain(p.resolver);
      }

      if (p.writer) {
        expect(plugins.writers).to.contain(p.writer);
      }

      if (p.postResolver) {
        expect(plugins.postResolvers).to.contain(p.postResolver);
      }
    });
  });

  it('should pick up sibling plugins', () => {
    var name = require('../package').name + '-sibling';

    // create a temporary plugin
    var dir = path.join('.test-plugins', 'node_modules', name);
    mkdirp.sync(dir);

    var file = path.join(dir, 'index.js');
    var content = 'module.exports = {resolver: () => {';
    content += 'console.log("custom plugin!");}}';

    fs.writeFileSync(file, content);
    var cwd = process.cwd();
    // done

    process.chdir('.test-plugins');
    var plugins = pluginUtils.load();
    process.chdir(cwd);

    var custom = require(path.join('..', dir));
    expect(plugins.resolvers).to.contain(custom.resolver);

    rimraf.sync(dir);
  });
});
