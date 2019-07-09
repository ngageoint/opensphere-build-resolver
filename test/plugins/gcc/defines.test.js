'use strict';

const Promise = require('bluebird');
const expect = require('chai').expect;
const defines = require('../../../plugins/gcc/defines');
const utils = require('../../../utils');
const fs = Promise.promisifyAll(require('fs'));
const rimraf = require('rimraf');
const path = require('path');

describe('gcc defines resolver', () => {
  afterEach(() => {
    defines.clear();

    // clean up the output file
    rimraf.sync(path.join(outputDir, 'gcc-defines-debug.js'));
  });

  var outputDir = path.join(process.cwd(), '.test');
  var baseDir = path.join(__dirname, 'defines');
  var dirs = fs.readdirSync(baseDir);

  var mapExpected = (p) => {
    return p.replace(/'$/, path.sep + '\'');
  };

  var verifyWriter = function(options, expectedOptions, expectedUncompiled) {
    if (expectedOptions) {
      expect(options).to.deep.equal(expectedOptions);
    } else {
      expect(options).to.be.empty;
    }

    var file = fs.readFileSync(path.join(outputDir, 'gcc-defines-debug.js'), 'utf8');

    // strip the JS file down to just the JSON
    expect(file).to.exist;
    file = file.substring(file.indexOf('= ') + 2, file.length - 1);

    var json = JSON.parse(file);
    if (expectedUncompiled) {
      expect(json).to.deep.equal(expectedUncompiled);
    } else {
      expect(json).to.be.empty;
    }
  };

  process.argv.push('--defineRoots');
  process.argv.push('test');

  dirs.forEach((d) => {
    var dir = path.join(baseDir, d);

    try {
      var pack = require(dir + '/package');
      var expected = require(dir + '/expected');
    } catch (e) {
      console.log('skipping ' + d);
    }

    if (pack) {
      it(d.replace(/-/g, ' '), () => {
        return defines.resolver(pack, dir).then(() => {
          var options = {};
          defines.adder(pack, options);

          if (!expected) {
            expect(options.define).not.to.exist;
            return;
          }

          expected = expected.map(mapExpected);

          expect(options.define).to.exist;
          expect(options.define.length).to.equal(expected.length);
          expected.forEach((x) => {
            expect(options.define).to.contain(x);
          });
        });
      });
    }
  });

  it('should default the relative path to "."', () => {
    var dir = path.resolve(baseDir, 'should-use-explicitly-defined-src-directory');
    var oldDir = process.cwd();
    process.chdir(dir);

    var pack = require(dir + '/package');
    var expected = require(dir + '/expected');
    return defines.resolver(pack, '.').then(() => {
      var options = {};
      defines.adder(pack, options);

      expected = expected.map(mapExpected);

      expect(options.define).to.exist;
      expect(options.define.length).to.equal(expected.length);
      expected.forEach((x) => {
        expect(options.define).to.contain(x);
      });

      process.chdir(oldDir);
    });
  });

  it('should append to any defines that already exist', () => {
    var dir = path.resolve(baseDir, 'should-use-explicitly-defined-src-directory');
    var pack = require(dir + '/package');

    return defines.resolver(pack, dir).then(() => {
      var options = {
        define: ['existing=true']
      };

      defines.adder(pack, options);
      var expected = require(dir + '/expected').map(mapExpected);
      expect(options.define).to.exist;
      expect(options.define).to.contain('existing=true');
      expected.forEach((x) => {
        expect(options.define).to.contain(x);
      });
    });
  });

  it('should not create a debug defines file for libs', () => {
    var dir = path.resolve(baseDir, 'should-use-explicitly-defined-src-directory');
    var pack = require(dir + '/package');

    return defines.resolver(pack, dir)
      .then(() => {
        pack.build.type = 'lib';
        return defines.writer(pack, outputDir);
      })
      .then(() => {
        expect(fs.existsSync(path.join(outputDir, 'gcc-defines-debug.js'))).to.be.false;
        pack.build.type = 'app';
      });
  });

  it('should create a debug defines file for apps', () => {
    var dir = path.resolve(baseDir, 'should-use-explicitly-defined-src-directory');
    var pack = require(dir + '/package');

    return defines.resolver(pack, dir)
      .then(() => {
        return defines.writer(pack, outputDir);
      })
      .then(() => {
        var file = path.join(outputDir, 'gcc-defines-debug.js');
        expect(fs.existsSync(file)).to.be.true;
        return fs.readFileAsync(file, 'utf-8');
      })
      .then((content) => {
        dir = path.relative(process.cwd(), dir) + path.sep;
        expect(content).to.contain('"foo.ROOT": "' + dir + '"');
      });
  });

  it('should handle ignore list', () => {
    var options = {
      define: ['PROPERTY=""']
    };

    var pack = {
      name: 'test',
      build: {
        type: 'app',
        ignoreUncompiled: {
          'PROPERTY': true
        }
      }
    };

    var dir = path.resolve(baseDir, 'should-use-explicitly-defined-src-directory');
    return defines.resolver(pack, dir, 0)
      .then(() => {
        return defines.adder(pack, options);
      })
      .then(() => {
        return defines.writer(pack, outputDir);
      })
      .then(() => {
        verifyWriter(options, options, undefined);
      });
  });

  it('should parse booleans and numbers', () => {
    var options = {
      define: ['SOMETHING=123', 'FLAG=true', 'OTHER_FLAG=false']
    };

    var pack = {
      name: 'test',
      build: {
        type: 'app'
      }
    };

    var dir = path.resolve(baseDir, 'should-use-explicitly-defined-src-directory');
    return defines.resolver(pack, dir, 0)
      .then(() => {
        return defines.adder(pack, options);
      })
      .then(() => {
        return defines.writer(pack, outputDir);
      })
      .then(() => {
        verifyWriter(options, options, {
          'SOMETHING': 123,
          'FLAG': true,
          'OTHER_FLAG': false
        });
      });
  });

  it('should handle pre-defined roots', () => {
    var options = {};

    var pack = {
      name: 'test',
      build: {
        type: 'app',
        defineRoots: {
          'other.ROOT': '../other/'
        }
      }
    };

    var dir = path.resolve(baseDir, 'test');
    return defines.resolver(pack, dir, 0)
      .then(() => {
        return defines.adder(pack, options);
      })
      .then(() => {
        return defines.writer(pack, outputDir);
      })
      .then(() => {
        var expectedOptions = {
          'define': ['other.ROOT=\'test/\'']
        };
        var expectedUncompiled = {
          'other.ROOT': '../other/'
        };
        verifyWriter(options, expectedOptions, expectedUncompiled);
      });
  });

  it('should not redefine any roots unless the proper arguments were passed', () => {
    process.argv.pop();
    process.argv.pop();

    var dir = path.resolve(baseDir, 'should-use-explicitly-defined-src-directory');
    var pack = require(dir + '/package');

    return defines.resolver(pack, dir).then(() => {
      var options = {};
      defines.adder(pack, options);
      expect(options.define).not.to.exist;
    });
  });

  it('should resolve module defines', function() {
    var options = {};

    var basePath = 'resolve/index.js';
    var pack = {
      name: 'test',
      build: {
        type: 'app',
        moduleDefines: {
          'my.DEFINE': basePath
        }
      }
    };

    var dir = path.resolve(baseDir, 'test');
    return defines.resolver(pack, dir, 0)
      .then(() => {
        return defines.adder(pack, options);
      })
      .then(() => {
        return defines.writer(pack, outputDir);
      })
      .then(() => {
        var expectedPath = path.relative(dir, utils.resolveModulePath(basePath));
        var expectedUncompiled = {
          'my.DEFINE': expectedPath
        };

        verifyWriter(options, undefined, expectedUncompiled);
      });
  });
});
