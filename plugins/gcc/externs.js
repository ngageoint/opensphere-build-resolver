'use strict';

const Promise = require('bluebird');
const fs = Promise.promisifyAll(require('fs'));
const path = require('path');

var externs = [];

const resolveExterns = function(pack, projectDir) {
  var dir;

  if (pack.directories && pack.directories.externs) {
    dir = pack.directories.externs;
  }

  if (pack.build && pack.build.externs) {
    externs = externs.concat(pack.build.externs.map(function(extern) {
      return path.resolve(projectDir, extern);
    }));
  }

  if (dir) {
    dir = path.resolve(projectDir, dir);

    return fs.readdirAsync(path.resolve(projectDir, dir))
        .then(function(files) {
          files = files.filter(function(file) {
            return file.endsWith('.js');
          });

          externs = externs.concat(files.map(function(file) {
            return path.resolve(projectDir, dir, file);
          }));
        })
        .catch({code: 'ENOENT'}, function() {});
  }

  return Promise.resolve();
};

const addOptions = function(pack, options) {
  options.externs = externs;
};

const clear = function() {
  externs = [];
};

module.exports = {
  clear: clear,
  resolver: resolveExterns,
  adder: addOptions
};
