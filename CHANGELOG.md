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
