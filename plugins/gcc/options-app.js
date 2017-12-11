'use strict';
/* eslint camelcase: "off" */

module.exports = {
  compilation_level: 'ADVANCED',
  angular_pass: true,
  generate_exports: true,
  output_wrapper: '(function(){%output%}).call(window);'
};
