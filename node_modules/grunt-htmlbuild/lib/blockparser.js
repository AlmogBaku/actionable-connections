"use strict";
var grunt = require('grunt'),
	_ = grunt.util._;

var BlockParser = module.exports = function(origHtml, task, options) {
	this.origHtml = origHtml;
	this.task = task;
	this.options = options;
	this._blockRE =
		'(?:'

			// Indent whitespace
			+ '(^[ \t]+)?'

			// Begin tag
			+ '<!--[ \t]*' + options.tagName

			// Type
			+ ':([^ \\-]+)'

			// Args
			+ '(?:[ ]+(.+?))?'

			// Optional self-closing.
			+ '[ ]*(/)?-->'

			+ ')|('

			// End Tag
			+ '<!--[ \t]*end' + options.tagName + '[ \t]*-->'

			+ ')';
	this._blockREFlags = 'mg';
};

_.extend(BlockParser.prototype, {

	parse: function() {
		var re = new RegExp(this._blockRE, this._blockREFlags),
			contents = '',
			lastIndex = 0,
			match;

		while (!_.isNull(match = re.exec(this.origHtml))) {
			var indent = match[1] || '';
			contents += this.origHtml.substring(lastIndex, match.index)
				+ indent
				+ this._beginBlock(re, match);

			lastIndex = re.lastIndex;
		}

		return contents + this.origHtml.substring(lastIndex);
	},

	_beginBlock: function(re, match) {
		var contents = '',
			indent = match[1] || '',
			type = match[2],
			args = match[3],
			lastIndex = re.lastIndex;

		if (_.isString(match[4])) {
			grunt.event.emit(this.task.name + '.blocksingle', { type: type, args: args, beginTag: match[0] });
		}
		else {
			grunt.event.emit(this.task.name + '.blockbegin', { type: type, args: args, beginTag: match[0] });

			var nextMatch;
			while (!_.isNull(nextMatch = re.exec(this.origHtml)) && !_.isString(nextMatch[5])) {
				contents += this.origHtml.substring(lastIndex, nextMatch.index) + indent;

				var subBlock = this._beginBlock(re, nextMatch);
				if (subBlock === false)
					return false;

				// Append the result of the sub block.
				contents += subBlock;

				// Reset the last index to where the sub block left off.
				lastIndex = re.lastIndex;
			}

			if (_.isNull(nextMatch)) {
				grunt.fail.warn('Missing end tag for block. ' + match[0]);
				return false;
			}

			// Append any contents remaining after sub blocks.
			// If there were no sub blocks, then this will be the
			// contents since this block's begin tag.
			contents += this.origHtml.substring(lastIndex, nextMatch.index);
		}

		var parsed = this._runParser(indent, type, args, contents);
		if (!_.isString(match[4]))
			grunt.event.emit(this.task.name + '.blockend', { type: type, args: args, contents: contents, beginTag: match[0] });

		return parsed;
	},

	_runParser: function(indent, type, args, contents) {
		var parser = null;

		// User-defined type parser.
		if (this.options.typeParser && _.isFunction(this.options.typeParser[type]))
			parser = this.options.typeParser[type];

		// Built-in type parsers.
		else if (this.typeParser && _.isFunction(this.typeParser[type]))
			parser = this.typeParser[type];

		if (parser) {
			var replace = parser.apply(this, [ { type: type, args: args, contents: contents, indent: indent } ]);

			if (_.isString(replace))
				return replace;

			else if (_.isArray(replace))
				return replace.join('\n' + indent);
		}

		return '';
	},

	splitArgs: function(args, limit) {
		if (!_.isString(args))
			return args;

		if (limit == 1)
			return [ args ];

		var re = /^([^ \t]+)(?:[ \t]+(.+)])?$/,
			ret = [],
			match;

		if (!_.isFinite(limit))
			limit = -1;

		while (_.isString(args) && !_.isNull(match = args.match(re))) {
			ret.push(match[1]);
			args = match[2];

			if (limit > 0)
				limit--;

			if (limit == 0) {
				ret.push(args);
				return ret;
			}
		}

		return ret;
	},

	getTags: function(elementName, html) {
		var tagRE = new RegExp('<' + elementName + '( .+?)/?>', 'ig'),
			attrRE = / ([a-z0-9_\-]+)="([^"]+)"/ig,
			tags = [],
			tagMatch, attrMatch;

		while (!_.isNull(tagMatch = tagRE.exec(html))) {
			var tag = {
				_html: tagMatch[0]
			};

			while (!_.isNull(attrMatch = attrRE.exec(tagMatch[1]))) {
				tag[attrMatch[1]] = attrMatch[2];
			}

			tags.push(tag);
		}

		return tags;
	},

	typeParser: {
		uncomment:	require('../lib/parser-uncomment'),
		requirejs:	require('../lib/parser-requirejs'),
		js:			require('../lib/parser-js'),
		less:		require('../lib/parser-less')
	}
});