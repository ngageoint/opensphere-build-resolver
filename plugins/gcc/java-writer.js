'use strict';

const Promise = require('bluebird');
const fs = Promise.promisifyAll(require('fs'));
const path = require('path');

const genericWriter = function(basePackage, dir, options, file, test) {
  var javaArgs = [];
  var equalsKeys = ['js', 'jscomp_error', 'jscomp_off', 'jscomp_warning'];

  for (var key in options) {
    var value = options[key];

    if (test && key === 'js_output_file') {
      value = value.replace(basePackage.name + '.min.js', basePackage.name + '-test.min.js');
    }

    if (!(value instanceof Array)) {
      value = [value];
    }

    for (var i = 0, n = value.length; i < n; i++) {
      if (equalsKeys.indexOf(key) > -1) {
        javaArgs.push('--' + key + '=\'' + value[i] + '\'');
      } else {
        javaArgs.push('--' + key);

        if (value[i] !== true) {
          javaArgs.push(value[i]);
        }
      }
    }
  }

  var outputfile = path.join(dir, file);
  console.log('Writing ' + outputfile);

  return fs.writeFileAsync(outputfile, javaArgs.join(' '));
};

const writer = function(basePackage, dir, options) {
  return genericWriter(basePackage, dir, options, 'gcc-java-args');
};

module.exports = {
  writer: writer,
  genericWriter: genericWriter
};
