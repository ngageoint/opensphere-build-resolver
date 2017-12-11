'use strict';

const Promise = require('bluebird');
const fs = Promise.promisifyAll(require('fs'));
const path = require('path');

const writer = function(basePackage, dir, options) {
  var file = 'gcc-args.json';
  var outputfile = path.join(dir, file);
  console.log('Writing ' + outputfile);
  return fs.writeFileAsync(outputfile, JSON.stringify(options, null, 2));
};

module.exports = {
  writer: writer
};
