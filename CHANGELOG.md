# [3.1.0](https://github.com/ngageoint/opensphere-build-resolver/compare/v3.0.1...v3.1.0) (2018-08-21)


### Features

* **electron:** Add resolver for packaged electron deps ([68f2775](https://github.com/ngageoint/opensphere-build-resolver/commit/68f2775))

## [3.0.1](https://github.com/ngageoint/opensphere-build-resolver/compare/v3.0.0...v3.0.1) (2018-06-28)


### Bug Fixes

* **bootstrap4:** fixed theme selector for bootstrap 4 css check ([c6a2f4e](https://github.com/ngageoint/opensphere-build-resolver/commit/c6a2f4e))

# [3.0.0](https://github.com/ngageoint/opensphere-build-resolver/compare/v2.7.0...v3.0.0) (2018-06-26)


### Features

* **core:** Errors in resolver should return a failing error code ([597a83a](https://github.com/ngageoint/opensphere-build-resolver/commit/597a83a)), closes [#24](https://github.com/ngageoint/opensphere-build-resolver/issues/24)


### BREAKING CHANGES

* **core:** Most errors now fail the resolver script. This will require any template files that

make calls such as fs.whatever() to be more robust with their own error handling. Also, it is now

required to pass the output directory via --outputDir rather than the simple method it was passed

before.

# [2.7.0](https://github.com/ngageoint/opensphere-build-resolver/compare/v2.6.1...v2.7.0) (2018-06-06)


### Features

* **themes:** Add detection class to theme stylesheets. ([68abfe2](https://github.com/ngageoint/opensphere-build-resolver/commit/68abfe2))

<a name="2.6.1"></a>
## [2.6.1](https://github.com/ngageoint/opensphere-build-resolver/compare/v2.6.0...v2.6.1) (2018-05-02)


### Bug Fixes

* **scss:** continue if directory already exists ([b8e792e](https://github.com/ngageoint/opensphere-build-resolver/commit/b8e792e))

<a name="2.6.0"></a>
# [2.6.0](https://github.com/ngageoint/opensphere-build-resolver/compare/v2.5.0...v2.6.0) (2018-04-27)


### Features

* **theming:** Added support to generate theme files ([#21](https://github.com/ngageoint/opensphere-build-resolver/issues/21)) ([50fcdbb](https://github.com/ngageoint/opensphere-build-resolver/commit/50fcdbb))

<a name="2.5.0"></a>
# [2.5.0](https://github.com/ngageoint/opensphere-build-resolver/compare/v2.4.2...v2.5.0) (2018-04-06)


### Features

* **bootstrap:** adds support for resolving bootstrap scss ([61bddbd](https://github.com/ngageoint/opensphere-build-resolver/commit/61bddbd))

## [2.4.2](https://github.com/ngageoint/opensphere-build-resolver/compare/v2.4.1...v2.4.2) (2018-03-27)


### Bug Fixes

* **gcc:** Sort goog.require statements in GCC require-all.js. ([eb392d2](https://github.com/ngageoint/opensphere-build-resolver/commit/eb392d2)), closes [#13](https://github.com/ngageoint/opensphere-build-resolver/issues/13)

<a name="2.4.1"></a>
## [2.4.1](https://github.com/ngageoint/opensphere-build-resolver/compare/v2.4.0...v2.4.1) (2018-03-21)


### Bug Fixes

* **onboarding:** Resolve onboarding directories as for views. ([8b760bd](https://github.com/ngageoint/opensphere-build-resolver/commit/8b760bd))

<a name="2.4.0"></a>
# [2.4.0](https://github.com/ngageoint/opensphere-build-resolver/compare/v2.3.0...v2.4.0) (2018-03-07)


### Features

* **utils:** Resolve paths for scoped node modules. ([d669cfd](https://github.com/ngageoint/opensphere-build-resolver/commit/d669cfd))

<a name="2.3.0"></a>
# [2.3.0](https://github.com/ngageoint/opensphere-build-resolver/compare/v2.2.0...v2.3.0) (2018-03-06)


### Features

* **define:** Resolve module path defines for uncompiled builds. ([98f905f](https://github.com/ngageoint/opensphere-build-resolver/commit/98f905f))

<a name="2.2.0"></a>
# [2.2.0](https://github.com/ngageoint/opensphere-build-resolver/compare/v2.1.2...v2.2.0) (2018-03-05)


### Features

* **core:** Display resolved package version in output. ([c6bf25d](https://github.com/ngageoint/opensphere-build-resolver/commit/c6bf25d))

<a name="2.1.2"></a>
## [2.1.2](https://github.com/ngageoint/opensphere-build-resolver/compare/v2.1.1...v2.1.2) (2018-01-24)


### Bug Fixes

* **gcc:** conformance_configs should be a path ([b41cbd3](https://github.com/ngageoint/opensphere-build-resolver/commit/b41cbd3))

<a name="2.1.1"></a>
## [2.1.1](https://github.com/ngageoint/opensphere-build-resolver/compare/v2.1.0...v2.1.1) (2018-01-11)


### Bug Fixes

* **symlinks:** Allow detecting symlinks. Yarn roadblocks have been resolved. ([909aade](https://github.com/ngageoint/opensphere-build-resolver/commit/909aade))

<a name="2.1.0"></a>
# [2.1.0](https://github.com/ngageoint/opensphere-build-resolver/compare/v2.0.2...v2.1.0) (2018-01-05)


### Features

* **yarn:** Resolve node_modules paths to support yarn workspaces. ([f638e55](https://github.com/ngageoint/opensphere-build-resolver/commit/f638e55))

<a name="2.0.2"></a>
## [2.0.2](https://github.com/ngageoint/opensphere-build-resolver/compare/v2.0.1...v2.0.2) (2018-01-03)


### Bug Fixes

* **core:** fixed argument list and typo. Also added ability to pass plugins as those are expected ([31254e1](https://github.com/ngageoint/opensphere-build-resolver/commit/31254e1))

<a name="2.0.1"></a>
## [2.0.1](https://github.com/ngageoint/opensphere-build-resolver/compare/v2.0.0...v2.0.1) (2018-01-02)


### Bug Fixes

* **resolve:** replace missing slash ([96914d4](https://github.com/ngageoint/opensphere-build-resolver/commit/96914d4))

<a name="2.0.0"></a>
# [2.0.0](https://github.com/ngageoint/opensphere-build-resolver/compare/v1.0.0...v2.0.0) (2017-12-27)


### Features

* **gcc:** Update Google Closure Compiler options for 20171203 release. ([8afc7fd](https://github.com/ngageoint/opensphere-build-resolver/commit/8afc7fd))
* **plugins:** Skip detected plugin/config if the path is a symlink. ([90d5046](https://github.com/ngageoint/opensphere-build-resolver/commit/90d5046))


### BREAKING CHANGES

* **gcc:** The gcc error groups are not backwards compatible with older compilers.
This will also introduce new warnings unless `missingOverride` is added to `jscomp_off`
in package gcc options.
