'use strict';
/* eslint camelcase: "off" */
/* eslint no-warning-comments: "off" */

/**
This is from the compiler's help output:

Available Error Groups: accessControls, checkPrototypalTypes,
    checkRegExp, checkTypes, checkVars, conformanceViolations, const,
    constantProperty, deprecated, deprecatedAnnotations, duplicateMessage,
    es5Strict, externsValidation, functionParams, globalThis, invalidCasts,
    misplacedTypeAnnotation, missingOverride, missingPolyfill,
    missingProperties, missingProvide, missingRequire, missingReturn,
    missingSourcesWarnings, moduleLoad, moduleImports, msgDescriptions,
    nonStandardJsDocs, partialAlias, polymer, reportUnknownTypes,
    strictCheckTypes, strictMissingProperties, strictModuleDepCheck,
    strictPrimitiveOperators, suspiciousCode, typeInvalidation, undefinedNames,
    undefinedVars, underscore, unknownDefines, unusedLocalVariables,
    unusedPrivateMembers, uselessCode, untranspilableFeatures, visibility

The docs for jscomp_* state that you can use a wildcard. However, that wildcard
also enables a lot more undocumented items.

You may just want to check out the list here:
https://github.com/google/closure-compiler/blob/master/src/com/google/javascript/jscomp/DiagnosticGroups.java
*/
module.exports = {
  dependency_mode: 'PRUNE',
  source_map_format: 'V3',
  create_source_map: true,
  summary_detail_level: 3,
  language_in: 'ECMASCRIPT5_STRICT',
  warning_level: 'VERBOSE',
  define: [
    'goog.DEBUG=false',
    'goog.debug.LOGGING_ENABLED=true'
  ],
  // TODO: switch to this one
  // jscomp_error: '*',
  jscomp_error: [
    'accessControls',
    'checkPrototypalTypes',
    'checkRegExp',
    'checkTypes',
    'checkVars',
    'conformanceViolations',
    'const',
    'constantProperty',
    // 'deprecated',
    'deprecatedAnnotations',
    'duplicateMessage',
    'es5Strict',
    'externsValidation',
    'functionParams',
    'globalThis',
    'invalidCasts',
    'misplacedTypeAnnotation',
    'missingOverride',
    'missingPolyfill',
    'missingProperties',
    'missingProvide',
    'missingReturn',
    'missingSourcesWarnings',
    'moduleLoad',
    'msgDescriptions',
    'nonStandardJsDocs',
    'partialAlias',
    'polymer',
    // 'reportUnknownTypes',
    // 'strictCheckTypes',
    // 'strictMissingProperties',
    'strictModuleDepCheck',
    'strictPrimitiveOperators',
    'suspiciousCode',
    'typeInvalidation',
    'undefinedNames',
    'undefinedVars',
    'underscore',
    'unknownDefines',
    'unusedLocalVariables',
    'unusedPrivateMembers',
    'uselessCode',
    'untranspilableFeatures',
    'visibility'
  ],
  jscomp_warning: [
    'deprecated'
  ],
  // TODO: can we get rid of these too?
  jscomp_off: [
    // TODO: this is temporarily disabled while migrating to ES modules because it produces errors when a namespace
    // is globally referenced or implicitly required. enable this as needed when fixing errors, and move back to
    // jscomp_error when ready.
    'missingRequire',

    'reportUnknownTypes',
    'strictCheckTypes',
    'strictMissingProperties'
  ]
};
