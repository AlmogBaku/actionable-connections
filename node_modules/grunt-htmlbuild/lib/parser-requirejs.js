"use strict";
var grunt = require('grunt'),
	_ = grunt.util._,
	path = require('path');

module.exports = function(opts) {
	var syntax = 'Syntax: <data-main> [<dest> [<target>]] [<options-json>]',
		args = opts.args;

	if (!_.isString(args))
		grunt.fail.warn('Missing arguments. ' + syntax);

	var target = this.options.target,
		outTags = [],
		splitArgs = args.replace(/^[ \t]+/, '').replace(/[ \t]+$/, '').split(/ /);

	// Parse Arguments

	if (splitArgs.length < 1)
		grunt.fail.warn('Missing arguments. ' + syntax);

	// <data-main>
	var main = splitArgs.shift();
	grunt.event.emit(this.task.name + '.notice', { verbose: true, message: "Set main to " + main });
	splitArgs = splitArgs.length ? splitArgs.join(' ').replace(/^[ \t]+/, '').split(/ /) : splitArgs;

	// <dest>
	var dest = { short: main + '.js', full: path.join(this.options.baseUrl, main + '.js') };
	if (splitArgs.length && !splitArgs[0].match(/^[ \t]*{/)) {
		dest = { short: splitArgs[0], full: path.join(this.options.baseUrl, splitArgs[0]) };
		grunt.event.emit(this.task.name + '.notice', { verbose: true, message: "Set destination to " + dest.full });
		splitArgs.shift();
		splitArgs = splitArgs.length ? splitArgs.join(' ').replace(/^[ \t]+/, '').split(/ /) : splitArgs;
	}

	// <target>
	if (splitArgs.length && !splitArgs[0].match(/^[ \t]*{/)) {
		target = splitArgs.shift();
		grunt.event.emit(this.task.name + '.notice', { verbose: true, message: "Set target to " + target });
		splitArgs = splitArgs.length ? splitArgs.join(' ').replace(/^[ \t]+/, '').split(/ /) : splitArgs;
	}

	// <options>
	var argOptions = {};
	if (splitArgs.length && splitArgs[0].match(/^[ \t]*{/)) {
		try {
			argOptions = JSON.parse(splitArgs.join(' '));
		}
		catch (e) {
			grunt.fail.warn('Invalid JSON (' + e + '): ' + splitArgs.join(' '));
		}
	}

	// Process tags.

	outTags.push('<script src="' + dest.short + '"></script>');
	grunt.event.emit(this.task.name + '.notice', { verbose: true, message: "Added tag: " + outTags[outTags.length - 1] });

	grunt.event.emit(this.task.name + '.requirejs', {
		target: target,
		src: main + '.js',
		dest: dest.full,
		options: _.extend({
			baseUrl: path.dirname(main),
			name: path.basename(main),
			out: dest.full,
			mainConfigFile: main + '.js'
		}, argOptions)
	});

	grunt.event.emit(this.task.name + '.uglify', { target: target, src: dest.full, dest: dest.full });

	return outTags;
};