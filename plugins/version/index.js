const Promise = require('bluebird');
const fs = Promise.promisifyAll(require('fs'));
const path = require('path');

var overrideVersion = null;

const resolver = function(pack, projectDir, depth) {
  overrideVersion = pack.overrideVersion || overrideVersion;
  return Promise.resolve();
};

const writer = function(thisPackage, outputDir) {
  if (overrideVersion) {
    return fs.writeFileAsync(path.join(outputDir, 'overrideVersion'), overrideVersion);
  }

  return Promise.resolve();
};


module.exports = {
  resolver: resolver,
  writer: writer
};
