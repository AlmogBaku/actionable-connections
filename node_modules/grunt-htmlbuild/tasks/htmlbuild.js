/*
 * grunt-htmlbuild
 * https://github.com/amekkawi/grunt-htmlbuild
 *
 * Copyright (c) 2013 Andre Mekkawi
 * Licensed under the MIT license.
 */

'use strict';

module.exports = function(grunt) {
	var _ = grunt.util._,
		util = require('util'),
		path = require('path'),
		BlockParser = require('../lib/blockparser');

	grunt.registerMultiTask('htmlbuild', 'A more flexible replacement for grunt-usemin.', function() {
		var options = this.options({
			tagName: 'htmlbuild',
			baseDir: '',
			target: 'htmlbuild',
			typeParser: {}
		});

		var initFilesDest = function(config, target, dest) {
			if (!config.hasOwnProperty(target))
				config[target] = {};

			if (!config[target].hasOwnProperty('files'))
				config[target].files = [];

			var entry = { dest: dest, src: [] };
			config[target].files.push(entry);

			return entry.src;
		};

		this.files.forEach(function(file) {
			if (file.src.length != 1)
				grunt.fail.warn('Must specify only one source per dest.');

			var filepath = file.src[0];

			if (grunt.file.isFile(filepath)) {
				grunt.log.subhead('Processing: ' + filepath);

				try {
					var parser = new BlockParser(grunt.file.read(filepath), this, options),
						configChanged = {},
						concat = grunt.config(options.concat || 'concat'),
						uglify = grunt.config(options.uglify || 'uglify'),
						requirejs = grunt.config(options.requirejs || 'requirejs'),
						less = grunt.config(options.less || 'less'),
						concatDests,
						uglifyDests,
						lessDests;

					grunt.event.on(this.name + '.blocksingle', function(ev) {
						grunt.log.subhead("Build command found: " + grunt.log.wordlist([
							ev.type + ' ' + (ev.args || '')
						]));

						concatDests = {};
						uglifyDests = {};
						lessDests = {};
					});

					grunt.event.on(this.name + '.blockbegin', function(ev) {
						grunt.log.subhead("Block begin: " + grunt.log.wordlist([
							ev.type + ' ' + (ev.args || '')
						]));

						concatDests = {};
						uglifyDests = {};
						lessDests = {};
					});

					grunt.event.on(this.name + '.blockend', function(ev) {
						grunt.log.writeln("Block end: " + grunt.log.wordlist([
							ev.type + ' ' + (ev.args || '')
						]));
					});

					grunt.event.on(this.name + '.notice', function(ev) {
						grunt[ev.verbose ? 'verbose' : 'log'].writeln(ev.message);
					});

					grunt.event.on(this.name + '.concat', function(ev) {
						grunt.log.writeln("Added concat:" + ev.target + " " + grunt.log.wordlist([ ev.src, ev.dest ], { separator: ' -> ' }));
						configChanged[options.concat || 'concat'] = concat;

						if (!concatDests[ev.target])
							concatDests[ev.target] = {};

						if (!concatDests[ev.target][ev.dest])
							concatDests[ev.target][ev.dest] = initFilesDest(concat, ev.target, ev.dest);

						concatDests[ev.target][ev.dest].push(ev.src);
					});

					grunt.event.on(this.name + '.uglify', function(ev) {
						grunt.log.writeln("Added uglify:" + ev.target + " " + grunt.log.wordlist([ ev.src, ev.dest ], { separator: ' -> ' }));
						configChanged[options.uglify || 'uglify'] = uglify;

						if (!uglifyDests[ev.target])
							uglifyDests[ev.target] = {};

						if (!uglifyDests[ev.target][ev.dest])
							uglifyDests[ev.target][ev.dest] = initFilesDest(uglify, ev.target, ev.dest);

						uglifyDests[ev.target][ev.dest].push(ev.src);
					});

					grunt.event.on(this.name + '.less', function(ev) {
						grunt.log.writeln("Added less:" + ev.target + " " + grunt.log.wordlist([ ev.src, ev.dest ], { separator: ' -> ' }));
						configChanged[options.less || 'less'] = less;

						if (!lessDests[ev.target])
							lessDests[ev.target] = {};

						if (!lessDests[ev.target][ev.dest])
							lessDests[ev.target][ev.dest] = initFilesDest(less, ev.target, ev.dest);

						lessDests[ev.target][ev.dest].push(ev.src);
					});

					grunt.event.on(this.name + '.requirejs', function(ev) {
						grunt.log.writeln("Added requirejs:" + ev.target + " " + grunt.log.wordlist([ ev.src, ev.dest ], { separator: ' -> ' }));
						configChanged[options.requirejs || 'requirejs'] = requirejs;

						if (requirejs.hasOwnProperty(ev.target))
							grunt.fail.warn("A requirejs config already exists for the target: " + ev.target + '.');

						requirejs[ev.target] = _.extend(
							{ options: ev.options },
							requirejs[ev.target]
						);

					});

					var parsedHtml = parser.parse();
					grunt.verbose.writeln("Run complete");

					if (configChanged) {
						grunt.log.subhead("Config is now:")
						_.each(configChanged, function(val, key) {
							grunt.config(key, val);
							grunt.log.writeln('\n' + key + ':\n' + util.inspect(val, false, 4, true));
						});
					}

					try {
						grunt.file.write(file.dest, parsedHtml);
					}
					catch (e) {
						grunt.verbose.error(e);
						grunt.fail.warn('Failed to write dest file: ' + file.dest);
					}

				} catch (e) {
					grunt.verbose.error(e);
					grunt.fail.warn('Failed to read file: ' + filepath);
				}
			}
		}, this);
	});

};
