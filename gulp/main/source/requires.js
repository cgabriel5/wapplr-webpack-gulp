/*jshint bitwise: false*/
/*jshint browser: false*/
/*jshint esversion: 6 */
/*jshint node: true*/
/*jshint -W014 */
/*jshint -W018 */

"use strict";

// Node modules.
var fs = require("fs");
var path = require("path");

// Lazy load gulp plugins.
var $ = require("gulp-load-plugins")({
	rename: {
		"gulp-if": "gulpif",
		"gulp-json-sort": "json_sort",
		"gulp-jsbeautifier": "beautify",
		"gulp-prettier-plugin": "prettier",
		"gulp-strip-json-comments": "strip_jsonc"
	},
	postRequireTransforms: {
		json_sort: function(plugin) {
			return plugin.default;
		}
	}
});

// Universal modules.
var del = require("del");
var pump = require("pump");
var yargs = require("yargs");
var chalk = require("chalk");
var dir = require("node-dir");
var cmd = require("node-cmd");
var mkdirp = require("mkdirp");
var fe = require("file-exists");
var json = require("json-file");
var jsonc = require("comment-json");
var de = require("directory-exists");
var get = require("object-path-get");
var sequence = require("run-sequence");
var browser_sync = require("browser-sync");
var bs_autoclose = require("browser-sync-close-hook");

// Project utils.
var utils = require("./gulp/assets/utils/utils.js");
var print = utils.print;
var notify = utils.notify;
var gulp = utils.gulp;
var uri = utils.uri;
var browser = utils.browser;
var bangify = utils.bangify;
var globall = utils.globall;
var extension = utils.ext;
var expand_paths = utils.expand_paths;
var opts_sort = utils.opts_sort;
var escape = utils.escape;
// var unique = utils.unique;
var cli_highlight = utils.cli_highlight;
var cmp = utils.comparator;
