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
    strictPrimitiveOperators, suspiciousCode, typeInvalidation, undefinedVars,
    underscore, unknownDefines, unusedLocalVariables, unusedPrivateMembers,
    uselessCode, untranspilableFeatures, visibility

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
  jscomp_error: [
    'accessControls',
    'checkPrototypalTypes',
    'checkRegExp',
    'checkTypes',
    'checkVars',
    'conformanceViolations',
    'const',
    'constantProperty',
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
    // 'missingRequire',
    'missingReturn',
    'missingSourcesWarnings',
    'moduleLoad',
    'msgDescriptions',
    'nonStandardJsDocs',
    'partialAlias',
    'polymer',
    // 'reportUnknownTypes',
    // 'strictCheckTypes',
    'strictMissingProperties',
    'strictModuleDepCheck',
    'strictPrimitiveOperators',
    'suspiciousCode',
    'typeInvalidation',
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
    // Warn on deprecated API's to provide time to migrate them without breaking builds.
    'deprecated'
  ],
  jscomp_off: [
    // OpenLayers typedefs defined in the ol.typedefs module trigger this error group, due to global references being
    // disallowed. Enabling this rule will require refactoring those to actual externs.
    'missingRequire',

    // Reports an error when the compiler cannot determine the type of something.
    'reportUnknownTypes',
    // Reports an error when a type cannot be explicitly guaranteed. Errors are typically due to floated vars or cases
    // where a primitive can be null/undefined.
    'strictCheckTypes'
  ]
};
