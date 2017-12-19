'use strict';
/* eslint camelcase: "off" */
/* eslint no-warning-comments: "off" */

/**
This is from the compiler's help output:

Available Error Groups: accessControls, ambiguousFunctionDecl,
    checkRegExp, checkTypes, checkVars, conformanceViolations, const,
    constantProperty, deprecated, deprecatedAnnotations, duplicateMessage, es3,
    es5Strict, externsValidation, fileoverviewTags, functionParams, globalThis,
    internetExplorerChecks, invalidCasts, misplacedTypeAnnotation,
    missingGetCssName, missingOverride, missingPolyfill, missingProperties,
    missingProvide, missingRequire, missingReturn, moduleLoad, msgDescriptions,
    newCheckTypes, nonStandardJsDocs, missingSourcesWarnings,
    reportUnknownTypes, suspiciousCode, strictModuleDepCheck, typeInvalidation,
    undefinedNames, undefinedVars, unknownDefines, unusedLocalVariables,
    unusedPrivateMembers, uselessCode, useOfGoogBase, underscore, visibility

The docs for jscomp_* state that you can use a wildcard. However, that wildcard
also enables a lot more undocumented items.

You may just want to check out the list here:
https://github.com/google/closure-compiler/blob/master/src/com/google/javascript/jscomp/DiagnosticGroups.java
*/
module.exports = {
  dependency_mode: 'STRICT',
  source_map_format: 'V3',
  create_source_map: true,
  summary_detail_level: 3,
  language_in: 'ECMASCRIPT5_STRICT',
  warning_level: 'VERBOSE',
  define: [
    'goog.DEBUG=false',
    'goog.debug.LOGGING_ENABLED=true'
  ],
  // TODO: use new type inference algorithm
  // see https://github.com/google/closure-compiler/wiki/Using-NTI-(new-type-inference)
  // new_type_inf: true,

  // TODO: switch to this one
  // jscomp_error: '*',
  jscomp_error: [
    'accessControls',
    'ambiguousFunctionDecl',
    'checkRegExp',
    'checkTypes',
    'checkVars',
    'conformanceViolations',
    'const',
    'constantProperty',
    // 'deprecated',
    'deprecatedAnnotations',
    'duplicateMessage',
    // 'es3',
    'es5Strict',
    'externsValidation',
    'fileoverviewTags',
    'functionParams',
    'globalThis',
    'internetExplorerChecks',
    'invalidCasts',
    'misplacedTypeAnnotation',
    'missingGetCssName',
    'missingPolyfill',
    'missingProperties',
    // 'missingProvide',
    'missingRequire',
    'missingReturn',
    'moduleLoad',
    'msgDescriptions',
    // 'newCheckTypes',
    'nonStandardJsDocs',
    'missingSourcesWarnings',
    // 'reportUnknownTypes',
    'suspiciousCode',
    'strictModuleDepCheck',
    'typeInvalidation',
    'undefinedNames',
    'undefinedVars',
    'unknownDefines',
    'unusedLocalVariables',
    // 'unusedPrivateMembers',
    'useOfGoogBase',
    'uselessCode',
    'underscore',
    'visibility'
  ],
  jscomp_warning: [
    // If jscomp_error changes to *, you probably want this one
    // 'lintChecks'
    'deprecated',
    'missingOverride',
    'unusedPrivateMembers'
  ],
  // TODO: can we get rid of these too?
  jscomp_off: [
    'es3',
    'newCheckTypes',
    'reportUnknownTypes'
  ]
};
