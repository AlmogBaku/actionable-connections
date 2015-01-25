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

	if (splitArgs.length < 1)
		grunt.fail.warn('Missing arguments. ' + syntax);

	var dest = { short: splitArgs[0], full: path.join(this.options.baseUrl, splitArgs[0]) };
	grunt.event.emit(this.task.name + '.notice', { verbose: true, message: "Set destination to " + dest.full });

	_.each(this.getTags('script', contents), function(tag){
		grunt.event.emit(this.task.name + '.notice', { verbose: true, message: "Parsing tag: " + tag._html });

		if (!_.isString(tag.src)) {
			grunt.fail.warn("Tag missing src attribute: " + tag._html);
			return false;
		}

		if (!grunt.file.isFile(tag.src)) {
			grunt.fail.warn("Cannot find file for src: " + tag._html);
			return false;
		}

		if (!outTags.length) {
			outTags.push('<script src="' + dest.short + '"></script>');
			grunt.event.emit(this.task.name + '.notice', { verbose: true, message: "Added tag: " + outTags[outTags.length - 1] });
		}

		grunt.event.emit(this.task.name + '.uglify', { target: target, src: tag.src, dest: dest.full });

		if (_.isString(tag['data-main'])) {
			var requireDest = { short: _.isString(tag['data-dest']) ? tag['data-dest'] : tag['data-main'] };
			requireDest.full = path.join(this.options.baseUrl, requireDest.short);

			var requireTarget = tag['data-target'] ? tag['data-target'] : target;

			outTags.push('<script src="' + requireDest.short + '"></script>');
			grunt.event.emit(this.task.name + '.notice', { verbose: true, message: "Added tag: " + outTags[outTags.length - 1] });

			grunt.event.emit(this.task.name + '.requirejs', {
				target: requireTarget,
				src: tag['data-main'] + '.js',
				dest: requireDest.full,
				options: {
					baseUrl: path.dirname(tag['data-main']),
					name: path.basename(tag['data-main']),
					out: requireDest.full,
					mainConfigFile: tag['data-main'] + '.js'
				}
			});

			grunt.event.emit(this.task.name + '.uglify', { target: target, src: requireDest.full, dest: requireDest.full });
		}

	}, this);

	return outTags;
};