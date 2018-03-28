/**
 * Variable is declared outside of tasks to be able to use it in
 *     multiple tasks. The variable is populated in the pretty:gitfiles
 *     task and used in the pretty task.
 */
var __modified_git_files;

/**
 * Get modified files as listed by Git.
 *
 * -q, --quick [boolean]
 *     Only prettify the git modified files.
 *
 * --staged [boolean]
 *     Used with the --quick flag it only prettifies the staged
 *     files.
 *
 * @internal - Used to prepare the pretty task.
 */
gulp.task("pretty:gitfiles", function(done) {
	// Run yargs.
	var __flags = yargs
		.option("quick", {
			alias: "q",
			type: "boolean"
		})
		.option("staged", {
			type: "boolean"
		}).argv;

	// Get flag values.
	var quick = __flags.quick;
	var staged = __flags.staged;

	// The flags must be present to get the modified files or else
	// skip to the main pretty task.
	if (!(quick || staged)) {
		return done();
	}

	// Reset the variable when the staged flag is provided.
	staged = staged ? "--cached" : "";

	// Diff filter: [https://stackoverflow.com/a/6879568]
	// Untracked files: [https://stackoverflow.com/a/3801554]
	// Example plugin: [https://github.com/azz/pretty-quick]

	// The commands to run.
	var untracked_files = "git ls-files --others --exclude-standard";
	var git_diff_files = `git diff --name-only --diff-filter="ACMRTUB" ${staged}`;

	// Get the list of modified files.
	cmd.get(
		`${git_diff_files}
		${untracked_files}`,
		function(err, data) {
			// Clean the data.
			data = data.trim();

			// Set the variable. If the data is empty there are no
			// files to prettify so return an empty array.
			__modified_git_files = data ? data.split("\n") : [];

			return done();
		}
	);
});

/**
 * Beautify (HTML, JS, CSS, & JSON) project files.
 *
 * • By default files in the following directories or containing the
 *   following sub-extensions are ignored: ./node_modules/, ./git/,
 *   vendor/, .ig., and .min. files.
 * • Special characters in globs provided via the CLI (--pattern) might
 *   need to be escaped if getting an error.
 *
 * -t, --type [string]
 *     The file extensions types to clean.
 *
 * -p, --pattern [array]
 *     Use a glob to find files to prettify.
 *
 * -i, --ignore [array]
 *     Use a glob to ignore files.
 *
 * --test [boolean]
 *     A test run that only shows the used globs before
 *     prettifying. Does not prettify at all.
 *
 * -e, --empty [boolean]
 *     Empty default globs array. Careful as this can prettify
 *     all project files. By default the node_modules/ is ignored, for
 *     example. Be sure to exclude files that don't need to be prettified
 *     by adding the necessary globs with the --pattern option.
 *
 * -l, --line-ending [string]
 *     If provided, the file ending will get changed to provided
 *     character(s). Line endings default to LF ("\n").
 *
 * -p, --cssprefix [boolean]
 *     Autoprefixer CSS files.
 *
 * -u, --unprefix [boolean]
 *     Unprefix CSS files.
 *
 * $ gulp pretty
 *     Prettify all HTML, CSS, JS, JSON files.
 *
 * $ gulp pretty --type "js, json"
 *     Only prettify JS and JSON files.
 *
 * $ gulp pretty --pattern "some/folder/*.js"
 *     Prettify default files and all JS files.
 *
 * $ gulp pretty --ignore "*.js"
 *     Prettify default files and ignore JS files.
 *
 * $ gulp pretty --test
 *     Halts prettifying to show the globs to be used for prettifying.
 *
 * $ gulp pretty --empty --pattern "some/folder/*.js"
 *     Flag indicating to remove default globs.
 *
 * $ gulp pretty --line-ending "\n"
 *     Make files have "\n" line-ending.
 *
 * $ gulp pretty --quick
 *     Only prettify the git modified files.
 *
 * $ gulp pretty --staged
 *     Performs a --quick prettification on Git staged files.
 *
 * $ gulp pretty --cssprefix
 *     Prettify HTML, CSS, JS, JSON, and autoprefix CSS files.
 *
 * $ gulp pretty --unprefix
 *     Prettify HTML, CSS, JS, JSON, and unprefix CSS files.
 */
gulp.task("pretty", ["pretty:gitfiles"], function(done) {
	var unprefix = require("postcss-unprefix");
	var autoprefixer = require("autoprefixer");
	var perfectionist = require("perfectionist");
	var shorthand = require("postcss-merge-longhand");

	// Run yargs.
	var __flags = yargs
		.option("type", {
			alias: "t",
			type: "string"
		})
		.option("pattern", {
			alias: "p",
			type: "array"
		})
		.option("ignore", {
			alias: "i",
			type: "array"
		})
		.option("test", {
			type: "boolean"
		})
		.option("empty", {
			alias: "e",
			type: "boolean"
		})
		.option("cssprefix", {
			alias: "c",
			type: "boolean"
		})
		.option("unprefix", {
			alias: "u",
			type: "boolean"
		})
		.option("line-ending", {
			alias: "l",
			type: "string"
		}).argv;

	// Get flag values.
	var type = __flags.t || __flags.type;
	var patterns = __flags.p || __flags.pattern;
	var ignores = __flags.i || __flags.ignore;
	var test = __flags.test;
	var empty = __flags.e || __flags.empty;
	var cssprefix = __flags.cssprefix || __flags.c;
	var remove_prefixes = __flags.unprefix || __flags.u;
	var ending = __flags.l || __flags["line-ending"] || EOL_ENDING;

	// By default CSS files will only be unprefixed and beautified. If needed
	// files can also be autoprefixed when the --cssprefix/-p flag is used.
	var css_plugins = [perfectionist(PERFECTIONIST)];

	// To unprefix CSS files one of two things must happen. Either the
	// unprefix or the cssprefix flag must be provided. The unprefix flag
	// is self-explanatory but we also need to unprefix the code when the
	// cssprefix flag is supplied to start the CSS prefixing from a clean
	// unprefixd state.
	if (remove_prefixes || cssprefix) {
		css_plugins.unshift(unprefix());
	}

	// If the flag is provided, shorthand and autoprefix CSS.
	if (cssprefix) {
		css_plugins.splice(1, 0, shorthand(), autoprefixer(AUTOPREFIXER));
	}

	// Default globs: look for HTML, CSS, JS, and JSON files. They also
	// exclude files containing a ".min." as this is the convention used
	// for minified files. The node_modules/, .git/, and all vendor/
	// files are also excluded.
	var files = [
		$paths.files_common,
		$paths.not_min,
		bangify(globall($paths.node_modules_name)),
		bangify(globall($paths.git)),
		$paths.not_vendor,
		$paths.not_ignore
	];

	// When the empty flag is provided the files array will be emptied.
	if (empty) {
		files.length = 0;
	}

	// Merge the changed files to the patterns array. This means that the
	// --quick/--staged flags are set.
	if (__modified_git_files) {
		// Note: When the __modified_git_files variable is an empty array
		// this means that there are no Git modified/staged files. So
		// simply remove all the globs from the files array to prevent
		// anything from being prettified.
		if (!__modified_git_files.length) {
			files.length = 0;
		}

		// Add the changed files to the patterns array.
		patterns = (patterns || []).concat(__modified_git_files);
	}

	// Reset the files array when extension types are provided.
	if (type) {
		// Remove all spaces from provided types string.
		type = type.replace(/\s+?/g, "");

		// Note: When using globs and there is only 1 file type like in
		// ".{js}", for example, it will not work. As this won't work the
		// "{}" must not be present. They only seem to work when multiple
		// options are used like .{js,css,html}. This is normalized below.
		if (-~type.indexOf(",")) {
			type = "{" + type + "}";
		}

		// Finally, reset the files array.
		files[0] = `**/*.${type}`;
	}

	// Add user provided glob patterns.
	if (patterns) {
		// Only do changes when the type flag is not provided. Therefore,
		// in other words, respect the type flag.
		if (!type) {
			files.shift();
		}

		// Add the globs.
		patterns.forEach(function(glob) {
			files.push(glob);
		});
	}

	// Add user provided exclude/negative glob patterns. This is useful
	// when needing to exclude certain files/directories.
	if (ignores) {
		// Add the globs.
		ignores.forEach(function(glob) {
			files.push(bangify(glob));
		});
	}

	// Show the used glob patterns when the flag is provided.
	if (test) {
		print.ln();
		print(chalk.underline("Patterns"));

		// Log the globs.
		files.forEach(function(glob) {
			print(`  ${glob}`);
		});

		print.ln();

		return done();
	}

	pump(
		[
			gulp.src(files, {
				dot: true,
				base: $paths.dot
			}),
			// Note: Filter out all non common files. This is more so a
			// preventive measure as when using the --quick flag any modified
			// files will get passed in. This makes sure to remove all image,
			// markdown files for example.
			$.filter([$paths.files_common]),
			$.sort(opts_sort),
			// Prettify HTML files.
			$.gulpif(extension.ishtml, $.beautify(JSBEAUTIFY)),
			// Sort JSON files.
			$.gulpif(
				function(file) {
					// Note: File must be a JSON file and cannot contain the
					// comment (.cm.) sub-extension to be sortable as comments
					// are not allowed in JSON files.
					return extension(file, ["json"]) &&
						!-~file.path.indexOf(".cm.")
						? true
						: false;
				},
				$.json_sort({
					space: JINDENT
				})
			),
			// Prettify JS/JSON files.
			$.gulpif(function(file) {
				// Exclude HTML and CSS files.
				return extension(file, ["html", "css"]) ? false : true;
			}, $.prettier(PRETTIER)),
			// Prettify CSS files.
			$.gulpif(extension.iscss, $.postcss(css_plugins)),
			$.eol(ending),
			$.debug.edit(),
			gulp.dest($paths.basedir)
		],
		done
	);
});
