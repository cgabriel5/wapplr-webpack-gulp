/**
 * Provides this Gulp task documentation.
 *
 * -V, --verbose [boolean]
 *     Print complete documentation.
 *
 * -i, --internal [boolean]
 *     Print internal (yellow) tasks.
 *
 * -F, --filter [string]
 *     Names of tasks to show documentation for.
 *
 * $ gulp help
 *     Print tasks with descriptions only.
 *
 * $ gulp help --verbose
 *     Print full documentation (flags, usage, etc.).
 *
 * $ gulp help --filter "open default dependency"
 *     Print documentation for provided task names.
 *
 * $ gulp help --internal
 *     Include documentation for internally used tasks.
 */
gulp.task("help", function(done) {
	// Run yargs.
	var __flags = yargs
		.option("verbose", {
			alias: "V",
			type: "boolean"
		})
		.option("filter", {
			alias: "F",
			type: "string"
		})
		.option("internal", {
			alias: "i",
			type: "boolean"
		}).argv;

	// Get flag values.
	var verbose = __flags.V || __flags.verbose;
	var filter = __flags.F || __flags.filter;
	var internal = __flags.i || __flags.internal;

	// Get file names to use.
	var names = BUNDLE_GULP.source.names;
	var name_default = names.default;
	var name_main = names.main;

	// If gulpfile.js exists use that. Else fall back to gulpfile-main.js.
	var gulpfile = fe.sync($paths.basedir + name_default)
		? name_default
		: name_main;

	// Store file content in this variable.
	var content = "";

	pump(
		[
			gulp.src(gulpfile, {
				cwd: $paths.basedir
			}),
			$.fn(function(file) {
				// Store the file content.
				content = file.contents.toString();
			})
		],
		function() {
			var blocks = [];
			var lengths = [];
			var names = [];
			var string = content;
			var docblock_pattern = /^\/\*\*[\s\S]*?\*\/$/m;
			var task_name_pattern = /^gulp.task\(('|")([a-z:\-_]+)\1/;
			var match = string.match(docblock_pattern);

			// Loop over gulpfile content string and get all the docblocks.
			while (match) {
				var comment = match[0];
				// Get the match index.
				var index = match.index;
				// Get the match length.
				var length = comment.length;
				// Reset the string to exclude the match.
				string = string.substring(index + length, string.length).trim();

				// Now look for the task name. The name needs to be at the
				// front of the string to pertain to the current docblock
				// comment. Therefore, it must have an index of 0.
				var task_name_match = string.match(task_name_pattern);

				// If no task name match continue and skip. Or task name has
				// to be at the front of the string.
				if (!task_name_match || task_name_match.index !== 0) {
					// Reset the match pattern.
					match = string.match(docblock_pattern);
					continue;
				}

				// Check whether the task is internal.
				var is_internal = Boolean(-~comment.indexOf("@internal"));

				// Exclude internal tasks when the internal flag is not set.
				if (is_internal && !internal) {
					// Reset the match pattern.
					match = string.match(docblock_pattern);
					continue;
				}

				// Get the task name.
				var task_name = task_name_match[2];

				// Filter if flag present. Also grab the length of the tasks.
				if (filter) {
					if (-~filter.indexOf(task_name) || task_name === "help") {
						// Store the task name length.
						lengths.push(task_name.length);
					} else {
						// Reset the match pattern.
						match = string.match(docblock_pattern);
						continue;
					}
				} else {
					// When no flag present just add all to the array.
					lengths.push(task_name.length);
				}

				// Add the comment and task name to array:
				// [ task name , task docblock comment , is task internal? ]
				blocks.push([task_name, comment, is_internal]);
				// Reset the match pattern.
				match = string.match(docblock_pattern);
			}

			// Get the task max length.
			var max_length = Math.max.apply(null, lengths);

			var newline = "\n";

			// Replacer function will bold all found flags in docblock.
			var replacer = function(match) {
				return chalk.bold(match);
			};

			// Remove all the docblock comment syntax.
			var remove_comment_syntax = function(string) {
				return string
					.replace(/(^\/\*\*)|( \*\/$)|( \* ?)/gm, "")
					.trim();
			};

			print.ln();
			print(chalk.bold.underline("Available Tasks"));
			print.ln();

			var tasks = {};

			// Loop over every match get needed data.
			blocks.forEach(function(block) {
				// Get task name.
				var name = block[0];
				var internal = block[2];
				// Reset the block var to the actual comment block.
				block = block[1];

				// Skip if no name is found.
				if (!name) {
					return;
				}

				// Reset name.
				block = block.replace(
					new RegExp("task: " + name + "$", "m"),
					""
				);

				// Remove doc comment syntax.
				block = remove_comment_syntax(block);

				// *************************************************
				// For the time being this method of scraping for the
				// description is fine but it must be made better in a
				// future iteration. This way limits the description to
				// a single line and sometimes that is not enough to
				// describe its function.
				// *************************************************

				// Functions with only a description and nothing else,
				// will not have any new lines in its description.
				// Therefore, simply use its entire documentation as its
				// description.
				var newline_index = block.indexOf(`${newline}${newline}`);
				if (newline_index === -1) {
					newline_index = block.length;
				}

				// Get the description.
				var desc = block.substring(0, newline_index);

				// Add the information to the tasks object.
				tasks[name] = {
					text: block,
					desc: desc,
					internal: internal
				};

				// Skip the help name as this is always the first no matter
				if (name !== "help") {
					names.push(name);
				}
			});

			// Sort the array names.
			names.sort(function(a, b) {
				return cmp(a, b) || cmp(a.length, b.length);
			});

			// Add the help task to the front of the array.
			names.unshift("help");

			// Loop over to print this time.
			names.forEach(function(name) {
				// Get the block.
				var task = tasks[name];
				var block = task.text;
				var desc = task.desc;
				var internal = task.internal;

				// Task name color will change based on whether it's
				// an internal task.
				var color = !internal ? "bold" : "yellow";

				// Loop over lines.
				if (verbose || name === "help") {
					// Bold the tasks.
					block = block.replace(/\s\-\-?[a-z-]*/gi, replacer);

					// Print the task name.
					print("   " + chalk[color](name));

					var lines = block.split(newline);
					lines.forEach(function(line) {
						print(`     ${chalk.gray(line)}`);
					});

					// Bottom padding.
					print.ln();
				} else {
					// Only show the name and its description.
					print(
						"   " +
							chalk[color](name) +
							" ".repeat(max_length - name.length + 3) +
							desc
					);
				}
			});

			if (!verbose) {
				// Bottom padding.
				print.ln();
			}

			done();
		}
	);
});
