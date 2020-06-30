# [7.3.0](https://github.com/ngageoint/opensphere-build-resolver/compare/v7.2.0...v7.3.0) (2020-06-30)


### Features

* **theming:** allows dependancies to define themes and provide fonts ([0330a5a](https://github.com/ngageoint/opensphere-build-resolver/commit/0330a5addc029c40c96c7f0dc9f49857d5843a2b))

# [7.2.0](https://github.com/ngageoint/opensphere-build-resolver/compare/v7.1.2...v7.2.0) (2020-05-22)


### Features

* **gcc:** allow plugins to libraries to have entry_points ([018990c](https://github.com/ngageoint/opensphere-build-resolver/commit/018990cedbb82f8efedb67334346df43080e117c))

## [7.1.2](https://github.com/ngageoint/opensphere-build-resolver/compare/v7.1.1...v7.1.2) (2020-04-22)


### Bug Fixes

* **config:** merge delete should always delete ([0c91d9c](https://github.com/ngageoint/opensphere-build-resolver/commit/0c91d9c8f745b4948d8c73f7c9daca791e8871a3))

## [7.1.1](https://github.com/ngageoint/opensphere-build-resolver/compare/v7.1.0...v7.1.1) (2020-04-20)


### Bug Fixes

* **utils:** only consider plugin/config of root package ([2dc6185](https://github.com/ngageoint/opensphere-build-resolver/commit/2dc6185b00ebe0ed6c63591f77f8d6f4e0880ddf))

# [7.1.0](https://github.com/ngageoint/opensphere-build-resolver/compare/v7.0.3...v7.1.0) (2020-03-03)


### Features

* **gcc:** add goog.SEAL_MODULE_EXPORTS=false for tests ([4c1d8a6](https://github.com/ngageoint/opensphere-build-resolver/commit/4c1d8a69a1ba86bc2f886958bc7d6ff4f0d6cf2d))

## [7.0.3](https://github.com/ngageoint/opensphere-build-resolver/compare/v7.0.2...v7.0.3) (2020-02-13)


### Bug Fixes

* **plugins:** use character class for path separators ([87eaab6](https://github.com/ngageoint/opensphere-build-resolver/commit/87eaab6faf3289781b952b5d4dd9c681a2648644)), closes [#55](https://github.com/ngageoint/opensphere-build-resolver/issues/55)

## [7.0.2](https://github.com/ngageoint/opensphere-build-resolver/compare/v7.0.1...v7.0.2) (2020-02-12)


### Bug Fixes

* **gcc:** locate source by goog.module ([13b4cbf](https://github.com/ngageoint/opensphere-build-resolver/commit/13b4cbfce9092854608fed11da412f1a00ee6b11))

## [7.0.1](https://github.com/ngageoint/opensphere-build-resolver/compare/v7.0.0...v7.0.1) (2020-02-03)


### Bug Fixes

* **gcc:** add hide_warnings_for to gcc options for tests ([42197d9](https://github.com/ngageoint/opensphere-build-resolver/commit/42197d9f6762eb2c901b73f722f92839d9fc215b))
* **gcc:** avoid using singleton test options instance ([0149230](https://github.com/ngageoint/opensphere-build-resolver/commit/0149230fbbab8050693f062da150f4f1b7847f23))

# [7.0.0](https://github.com/ngageoint/opensphere-build-resolver/compare/v6.3.0...v7.0.0) (2020-02-03)


### Code Refactoring

* **goog:** update gcc args for 20200112.0.0 ([3e88e07](https://github.com/ngageoint/opensphere-build-resolver/commit/3e88e07c3324c95662af0b1091cd94b1fd7668b1))


### BREAKING CHANGES

* **goog:** This requires Closure Compiler 20200112.0.0, which is
included with opensphere-build-closure-helper@5.0.0.

# [6.3.0](https://github.com/ngageoint/opensphere-build-resolver/compare/v6.2.2...v6.3.0) (2020-01-29)


### Features

* **gcc:** use goog.defines that are assigned to a value ([a9a9638](https://github.com/ngageoint/opensphere-build-resolver/commit/a9a96387b33c8892a1b61526d72b1392d4219ec6))

## [6.2.2](https://github.com/ngageoint/opensphere-build-resolver/compare/v6.2.1...v6.2.2) (2020-01-14)


### Bug Fixes

* **gcc:** sort entry_point options by descending priority ([25dd17e](https://github.com/ngageoint/opensphere-build-resolver/commit/25dd17e1f85a81963a7b8941b329129b74032480))

## [6.2.1](https://github.com/ngageoint/opensphere-build-resolver/compare/v6.2.0...v6.2.1) (2019-11-26)


### Bug Fixes

* **core:** fix typo in alreadyResolved check ([8a183f9](https://github.com/ngageoint/opensphere-build-resolver/commit/8a183f9f1bdb5e712d1fe88da4bd571474c9bcf2))

# [6.2.0](https://github.com/ngageoint/opensphere-build-resolver/compare/v6.1.3...v6.2.0) (2019-11-25)


### Features

* better priority ordering for plugins ([69a3415](https://github.com/ngageoint/opensphere-build-resolver/commit/69a34154f6bd620fb7ac42c8b0c9a40de03592e8)), closes [#7](https://github.com/ngageoint/opensphere-build-resolver/issues/7) [#18](https://github.com/ngageoint/opensphere-build-resolver/issues/18)

## [6.1.3](https://github.com/ngageoint/opensphere-build-resolver/compare/v6.1.2...v6.1.3) (2019-11-10)


### Bug Fixes

* **core:** fix module path detection for Windows-based builds ([e6d64c0](https://github.com/ngageoint/opensphere-build-resolver/commit/e6d64c09ff3f2fc25ba15b72453eb4a3a28d5fbb))

## [6.1.2](https://github.com/ngageoint/opensphere-build-resolver/compare/v6.1.1...v6.1.2) (2019-08-16)


### Bug Fixes

* **config:** fix slashes in debug config paths ([e67136e](https://github.com/ngageoint/opensphere-build-resolver/commit/e67136e))
* **gcc:** fix slashes in ROOT defines ([bf5a1b1](https://github.com/ngageoint/opensphere-build-resolver/commit/bf5a1b1))

## [6.1.1](https://github.com/ngageoint/opensphere-build-resolver/compare/v6.1.0...v6.1.1) (2019-08-15)


### Bug Fixes

* **gcc:** handle win32 paths for defines and options ([4a6aa29](https://github.com/ngageoint/opensphere-build-resolver/commit/4a6aa29))

# [6.1.0](https://github.com/ngageoint/opensphere-build-resolver/compare/v6.0.0...v6.1.0) (2019-08-13)


### Features

* better windows support ([cac7761](https://github.com/ngageoint/opensphere-build-resolver/commit/cac7761))

# [6.0.0](https://github.com/ngageoint/opensphere-build-resolver/compare/v5.2.1...v6.0.0) (2019-08-02)


### Bug Fixes

* **resources:** Require file patterns to match something. ([b5ebbe8](https://github.com/ngageoint/opensphere-build-resolver/commit/b5ebbe8))


### BREAKING CHANGES

* **resources:** Glob patterns specified in the resources  array
must now match at least one file, or the resolver will error.

## [5.2.1](https://github.com/ngageoint/opensphere-build-resolver/compare/v5.2.0...v5.2.1) (2019-07-15)


### Bug Fixes

* **gcc:** Resolve module defines relative to the project dir. ([7d58c19](https://github.com/ngageoint/opensphere-build-resolver/commit/7d58c19))

# [5.2.0](https://github.com/ngageoint/opensphere-build-resolver/compare/v5.1.1...v5.2.0) (2019-06-19)


### Bug Fixes

* **gcc:** Write test output separately from build. ([a40167a](https://github.com/ngageoint/opensphere-build-resolver/commit/a40167a))


### Features

* **gcc:** Write test options to JSON. ([1a808af](https://github.com/ngageoint/opensphere-build-resolver/commit/1a808af))

## [5.1.1](https://github.com/ngageoint/opensphere-build-resolver/compare/v5.1.0...v5.1.1) (2019-06-18)


### Bug Fixes

* **gcc:** check for undefined value ([51c04bf](https://github.com/ngageoint/opensphere-build-resolver/commit/51c04bf))
* **gcc:** test writer should copy in js_output_file ([0477783](https://github.com/ngageoint/opensphere-build-resolver/commit/0477783))

# [5.1.0](https://github.com/ngageoint/opensphere-build-resolver/compare/v5.0.2...v5.1.0) (2019-06-18)


### Features

* **gcc:** Add js_output_file to JSON compiler options. ([5098842](https://github.com/ngageoint/opensphere-build-resolver/commit/5098842))

## [5.0.2](https://github.com/ngageoint/opensphere-build-resolver/compare/v5.0.1...v5.0.2) (2019-04-01)


### Bug Fixes

* **gcc:** Deduplicate GCC defines. ([ae9c4ce](https://github.com/ngageoint/opensphere-build-resolver/commit/ae9c4ce))

## [5.0.1](https://github.com/ngageoint/opensphere-build-resolver/compare/v5.0.0...v5.0.1) (2019-03-28)


### Bug Fixes

* **gcc:** Sort GCC options in ascending package priority. ([1467d4c](https://github.com/ngageoint/opensphere-build-resolver/commit/1467d4c))

# [5.0.0](https://github.com/ngageoint/opensphere-build-resolver/compare/v4.1.2...v5.0.0) (2019-03-21)


### Features

* **electron:** Copy preload scripts for opensphere-electron. ([1cbf381](https://github.com/ngageoint/opensphere-build-resolver/commit/1cbf381))


### BREAKING CHANGES

* **electron:** This changes the format of the build.electron config.

## [4.1.2](https://github.com/ngageoint/opensphere-build-resolver/compare/v4.1.1...v4.1.2) (2019-02-27)


### Bug Fixes

* **grep:** Add a function to find lines in files matching a pattern. ([7bc5aec](https://github.com/ngageoint/opensphere-build-resolver/commit/7bc5aec)), closes [#32](https://github.com/ngageoint/opensphere-build-resolver/issues/32)

## [4.1.1](https://github.com/ngageoint/opensphere-build-resolver/compare/v4.1.0...v4.1.1) (2018-12-17)


### Bug Fixes

* **core:** Ignore paths that do not exist. ([f174bff](https://github.com/ngageoint/opensphere-build-resolver/commit/f174bff))

# [4.1.0](https://github.com/ngageoint/opensphere-build-resolver/compare/v4.0.0...v4.1.0) (2018-11-15)


### Features

* **scss:** Resolve scss paths from build config ([5131519](https://github.com/ngageoint/opensphere-build-resolver/commit/5131519))

# [4.0.0](https://github.com/ngageoint/opensphere-build-resolver/compare/v3.1.1...v4.0.0) (2018-10-09)


### Features

* **gcc:** Move missingOverride and unusedPrivateMembers to errors. ([eb2f581](https://github.com/ngageoint/opensphere-build-resolver/commit/eb2f581))


### BREAKING CHANGES

* **gcc:** Projects with Closure Compiler warnings for missingOverride or unusedPrivateMembers will need to fix those warnings before upgrading. They are now flagged as errors.

## [3.1.1](https://github.com/ngageoint/opensphere-build-resolver/compare/v3.1.0...v3.1.1) (2018-09-27)


### Bug Fixes

* **electron:** keep electron dev dependencies ([5e0d96e](https://github.com/ngageoint/opensphere-build-resolver/commit/5e0d96e))

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
