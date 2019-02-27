This is a non-JavaScript file used to test if the following lines get matched.

Should match:
goog.provide('test.readme.Thing1');
goog.provide('test.readme.Thing2');

Should not match:
/**
 * goog.provide('test.readme.Thing3');
 * goog.provide('test.readme.Thing4');
 */
