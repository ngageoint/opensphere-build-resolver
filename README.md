# opensphere-build-resolver

Resolves sources and other input for the Google Closure Compiler, sass for node-sass, template views for angular, and other items through a project's dependency tree.

## Problem
You want to use npm to manage your project and its dependencies, but you need to resolve source, css, sass, templates, or other resources from those dependencies and pass them as arguments on the command line to tools like the google-closure-compiler, node-sass, and others.

## Solution
This.

## Usage
Install it as a dependency of your package: `npm install opensphere-build-resolver --save-dev`

Update your `package.json` to make it an opensphere build project.
```javascript
"build": {
  "type": "lib", // for libraries, or "app" for applications, "plugin" for plugins, or "config" for config
  "pluggable": false, // whether or not you want the resolver to look for plugins like <packageName>-*

  // the rest here are extra options for a specific resolver, in this case the Google Closure Compiler
  "gcc": {
    "js": ['path/to/something/**.js'], // some source that isn't configured in a directory that the gcc resolver will naturally find
    "extra_annotation_name": ["api"]
  } 
},
"scripts": {
  "resolver": "os-resolve someOutputDirectory"
}
```

Now run `npm run resolver` and note the output in the given directory. You will want to ensure that your project does not have `dependencies` that should really be `devDependencies` (test frameworks, build systems, etc.).

## Lib or App Plugins
If your project has
```javascript
"build": {
  "pluggable": true
}
```
in its `package.json`, then the resolver will look for `packagename-plugin-yourPlugin` modules in:
```
../
package/node_modules
rootPackage/node_modules
```

The plugin package should have a peer dependency defined for your package:

```javascript
"peerDependencies" : {
  "packagename": "^1.2.3"
}
```

## Config Packages
```javascript
"build": {
  "type": "config"
  "config": "someConfigDirectory" or ["thing1.json", "thing2.json"],
  "priority": 50 // configs are merged from least to greatest
}
```
Any config value not ending in `.json` is assumed to be a directory. Configs within directories are merged in lexicographical order.

## Dependency Management
While we prefer that all actual source dependencies (such as google-closure-library, openlayers, etc.) or sass dependencies be installed and managed as npm dependencies, the resolver does support bower dependencies as long as they are stored in `bower_components` in the root of your project.

## Writing Plugins
Want to resolve more stuff? Write an opensphere-build-resolver plugin!

Your plugin should be named `opensphere-build-resolver-<something>` and have a peer dependency on `opensphere-build-resolver`.

Your plugin should have a `opensphere-build-resolver-<something>/index.js` file with exports like so:
```
module.exports = {
  // called for every package in the dependency tree
  resolver: function(currPackageJson, currPackageDirectory, depth): Promise (resolve value does not matter) // optional

  // called once after all packages have resolved
  postResolver: function(basePackageJson, outputDir): Promise (resolve value does not matter) // optional

  // called once after those ^
  writer: function(basePackageJson, outputDir) : Promise (resolve value does not matter) // optional
};
```

## About

[OpenSphere](https://github.com/ngageoint/opensphere) was developed at the National Geospatial-Intelligence Agency (NGA) in collaboration with BIT Systems. The government has "unlimited rights" and is releasing this software to increase the impact of government investments by providing developers with the opportunity to take things in new directions. The software use, modification, and distribution rights are stipulated within the Apache license.

## Pull Requests

If you'd like to contribute to this project, please make a pull request. We'll review the pull request and discuss the changes. All pull request contributions to this project will be released under the Apache license.

Software source code previously released under an open source license and then modified by NGA staff is considered a "joint work" (see 17 USC § 101); it is partially copyrighted, partially public domain, and as a whole is protected by the copyrights of the non-government authors and must be released according to the terms of the original open source license.

## License

Copyright 2017 BIT Systems

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
