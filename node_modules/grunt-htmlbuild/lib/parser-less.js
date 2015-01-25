"use strict";
var grunt = require('grunt'),
	_ = grunt.util._,
	path = require('path');

module.exports = function(opts) {
	var syntax = 'Syntax: <dest>',
		args = opts.args;

	if (!_.isString(args))
		grunt.fail.warn('Missing arguments. ' + syntax);

	var contents = opts.contents,
		target = this.options.target,
		outTags = [],
		splitArgs = args.split(/[ \t]+/);

	// Parse Arguments

	if (splitArgs.length < 1)
		grunt.fail.warn('Missing arguments. ' + syntax);

	var dest = { short: splitArgs[0], full: path.join(this.options.baseUrl, splitArgs[0]) };
	grunt.event.emit(this.task.name + '.notice', { verbose: true, message: "Set destination to " + dest.full });
	splitArgs.shift();

	_.each(this.getTags('link', contents), function(tag){
		grunt.event.emit(this.task.name + '.notice', { verbose: true, message: "Parsing tag: " + tag._html });

		if (!_.isString(tag.href)) {
			grunt.fail.warn("Tag missing href attribute: " + tag._html);
			return false;
		}

		if (!_.isString(tag.rel)) {
			grunt.fail.warn("Tag missing rel attribute: " + tag._html);
			return false;
		}

		if (!_.isString(tag.type)) {
			grunt.fail.warn("Tag missing type attribute: " + tag._html);
			return false;
		}

		if (tag.type != "text/css") {
			grunt.fail.warn("Tag's type attribute is not 'text/css': " + tag._html);
			return false;
		}

		if (!grunt.file.isFile(tag.href)) {
			grunt.fail.warn("Cannot find file for href: " + tag._html);
			return false;
		}

		if (!outTags.length) {
			outTags.push('<link rel="stylesheet" type="text/css" href="' + dest.short + '">');
			grunt.event.emit(this.task.name + '.notice', { verbose: true, message: "Added tag: " + outTags[outTags.length - 1] });
		}

		grunt.event.emit(this.task.name + '.less', { target: target, src: tag.href, dest: dest.full });
	}, this);

	return outTags;
};