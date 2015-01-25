# grunt-htmlbuild

> Variation of usemin.

## Getting Started
This plugin requires Grunt `~0.4.1`

If you haven't used [Grunt](http://gruntjs.com/) before, be sure to check out the [Getting Started](http://gruntjs.com/getting-started) guide, as it explains how to create a [Gruntfile](http://gruntjs.com/sample-gruntfile) as well as install and use Grunt plugins. Once you're familiar with that process, you may install this plugin with this command:

```shell
npm install grunt-htmlbuild --save-dev
```

One the plugin has been installed, it may be enabled inside your Gruntfile with this line of JavaScript:

```js
grunt.loadNpmTasks('grunt-htmlbuild');
```

## The "htmlbuild" task

### Overview
In your project's Gruntfile, add a section named `htmlbuild` to the data object passed into `grunt.initConfig()`.

```js
grunt.initConfig({
  htmlbuild: {
    options: {
      // Task-specific options go here.
    },
    your_target: {
      // Target-specific file lists and/or options go here.
    },
  },
})
```

### Options

#### options.tagName
Type: `String`
Default value: `htmlbuild`

TODO

#### options.baseDir
Type: `String`
Default value: ``

TODO

#### options.target
Type: `String`
Default value: `htmlbuild`

TODO

#### options.typeParser
Type: `Object`
Default value: `{}`

TODO

### Usage Examples

TODO

## Release History

* 2013-04-16   v0.1.2   Fixed htmlbuild so it properly uses options.concat, options.uglify, etc.
* 2013-04-15   v0.1.1   Added missing require() to htmlbuild.js
* 2013-04-15   v0.1.0   Work in progress release.
