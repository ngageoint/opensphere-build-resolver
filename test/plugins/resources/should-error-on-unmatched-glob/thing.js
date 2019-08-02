/* eslint-env es6 */

'use strict';

const path = require('path');

module.exports = {
  appVersion: '1.0.0',
  packageVersion: '1.0.0',
  basePath: __dirname,
  distPath: path.join('dist', 'thing'),
  templates: [
    {
      id: 'index',
      file: 'index-template.html',
      resources: [
        {
          source: __dirname,
          target: '',
          files: ['not-images']
        }
      ]
    }
  ],
  debugCss: path.join('.build', 'combined.css'),
  compiledCss: path.join('v1.0.0', 'styles', 'thing.min.css'),
  compiledJs: path.join('v1.0.0', 'thing.min.js')
};
