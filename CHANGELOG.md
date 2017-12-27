<a name="2.0.0"></a>
# [2.0.0](https://github.com/ngageoint/opensphere-build-resolver/compare/v1.0.0...v2.0.0) (2017-12-27)


### Features

* **gcc:** Update Google Closure Compiler options for 20171203 release. ([8afc7fd](https://github.com/ngageoint/opensphere-build-resolver/commit/8afc7fd))
* **plugins:** Skip detected plugin/config if the path is a symlink. ([90d5046](https://github.com/ngageoint/opensphere-build-resolver/commit/90d5046))


### BREAKING CHANGES

* **gcc:** The gcc error groups are not backwards compatible with older compilers.
This will also introduce new warnings unless `missingOverride` is added to `jscomp_off`
in package gcc options.
