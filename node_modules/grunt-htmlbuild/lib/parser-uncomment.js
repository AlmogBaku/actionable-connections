"use strict";
var grunt = require('grunt'),
	_ = grunt.util._;

module.exports = function(opts) {
	if (opts && !_.isString(opts.contents))
		return '';

	return opts.contents.replace(/^(\s*)<!--/, '$1').replace(/-->(\s*)$/, '$1');
};