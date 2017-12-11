'use strict';

const Promise = require('bluebird');
const expect = require('chai').expect;
const gcc = require('../../../plugins/gcc');
const fs = Promise.promisifyAll(require('fs'));
const rimraf = require('rimraf');
const path = require('path');

describe('gcc resolver', function() {
  afterEach(() => {
    gcc.clear();
    rimraf.sync(path.join(outputDir, '*'));
  });

  var outputDir = path.join(process.cwd(), '.test');

  var fullRun = (pack, dir, optDoWrite) => {
    process.argv.push('--defineRoots');
    process.argv.push('test');

    return gcc.resolver(pack, dir)
      .then(() => {
        return gcc.postResolver(pack, outputDir);
      })
      .then(() => {
        return optDoWrite ? gcc.writer(pack, outputDir) : null;
      }).then(() => {
        process.argv.pop();
        process.argv.pop();
      });
  };

  var getOptions = (pack, outputDir) => {
    process.argv.push('--defineRoots');
    process.argv.push('test');

    var opts = gcc._getOptions(pack, outputDir);

    process.argv.pop();
    process.argv.pop();

    return opts;
  };

  it('should not resolve config projects', () => {
    var pack = {
      name: 'thing',
      build: {
        type: 'config'
      }
    };

    return fullRun(pack, '', true)
      .then(() => {
        return fs.readdirAsync(outputDir);
      })
      .then(files => {
        expect(files.length).to.equal(0);
      });
  });

  it('should have the correct base options for libraries', () => {
    var pack = {
      name: 'thing',
      build: {
        type: 'lib'
      }
    };

    var expected = Object.assign({}, require('../../../plugins/gcc/options-base'));
    expected = Object.assign(expected, require('../../../plugins/gcc/options-lib'));
    expected.output_manifest = path.join(outputDir, 'gcc-manifest');
    expected.create_source_map = path.join(outputDir, pack.name + '.min.map');
    expected.js = [];
    expected.externs = [];

    var opts = gcc._getOptions(pack, outputDir);
    expect(opts).to.deep.equal(expected);
  });

  it('should throw an error if an entry point is not defined', () => {
    var pack = {
      name: 'thing',
      build: {
        type: 'app'
      }
    };

    var fn = () => {
      return gcc._getOptions(pack, outputDir);
    };

    expect(fn).to.throw(Error);
  });

  var dir = path.join(__dirname, 'index', 'project');
  var pack = require(path.join(dir, 'package'));

  it('should run the src resolver', () => {
    return fullRun(pack, dir).then(() => {
      var opts = getOptions(pack, outputDir);
      expect(opts.js.length).to.equal(1);
      expect(opts.js).to.contain(path.join(dir, 'src', '**.js'));
    });
  });

  it('should run the externs resolver', () => {
    return fullRun(pack, dir).then(() => {
      var opts = getOptions(pack, outputDir);
      expect(opts.externs.length).to.equal(1);
      expect(opts.externs).to.contain(path.join(dir, 'externs', 'lib.externs.js'));
    });
  });

  it('should run the defines resolver', () => {
    return fullRun(pack, dir).then(() => {
      var opts = getOptions(pack, outputDir);
      expect(opts.define).to.contain("project.ROOT='test" + path.sep + "'");
    });
  });

  it('should run the options resolver', () => {
    return fullRun(pack, dir).then(() => {
      var opts = getOptions(pack, outputDir);
      expect(opts.entry_point).to.contain('goog:thing');
    });
  });

  it('should write the builder args', () => {
    return fullRun(pack, dir, true).then(() => {
      expect(fs.existsSync(path.join(outputDir, 'gcb-python-args'))).to.be.true;
    });
  });

  it('should write the java args', () => {
    return fullRun(pack, dir, true).then(() => {
      expect(fs.existsSync(path.join(outputDir, 'gcc-java-args'))).to.be.true;
    });
  });
  
  it('should write the defines debug file', () => {
    return fullRun(pack, dir, true).then(() => {
      expect(fs.existsSync(path.join(outputDir, 'gcc-defines-debug.js'))).to.be.true;
    });
  });

  it('should write the java args for tests', () => {
    return fullRun(pack, dir, true).then(() => {
      expect(fs.existsSync(path.join(outputDir, 'gcc-test-args'))).to.be.true;
    });
  });

  it('should write the require-all.js file for libraries', () => {
    var p = Object.assign({}, pack);
    p.build.type = 'lib';

    return fullRun(p, dir, true).then(() => {
      expect(fs.existsSync(path.join(outputDir, 'require-all.js'))).to.be.true;
    });
  });

  it('should treat apps as libraries when they are used as such', () => {
    var pluginDir = path.join(__dirname, 'index', 'project-plugin-thing');
    var pluginPack = require(path.join(pluginDir, 'package'));
    pack.build.type = 'app';

    return gcc.resolver(pluginPack, pluginDir, 0)
      .then(() => {
        return gcc.resolver(pack, dir, 1);
      })
      .then(() => {
        return gcc.postResolver(pluginPack, outputDir);
      })
      .then(() => {
        var opts = getOptions(pluginPack, outputDir);
        console.log(opts.entry_point);
        expect(opts.entry_point.length).to.equal(2);
        expect(opts.entry_point).to.contain('goog:libcomp');
        expect(opts.entry_point).to.contain('goog:plugin');
      });
  });

  it('should not die if gcc config does not exist', () => {
    var pluginDir = path.join(__dirname, 'index', 'project-plugin-thing');
    var pluginPack = require(path.join(pluginDir, 'package'));
    pack.build.type = 'app';

    delete pluginPack.build.gcc;

    return gcc.resolver(pluginPack, pluginDir, 0)
      .then(() => {
        return gcc.resolver(pack, dir, 1);
      })
      .then(() => {
        return gcc.postResolver(pluginPack, outputDir);
      })
      .then(() => {
        var opts = getOptions(pluginPack, outputDir);
        expect(opts.entry_point).to.equal('goog:libcomp');
      });
  });
});
