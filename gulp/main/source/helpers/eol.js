/**
 * Change file line endings.
 *
 * -l, --line-ending <string>
 *     The type of line ending to use. Defaults to "lf" (\n).
 *
 * $ gulp eol
 *     Check file line endings.
 *
 * $ gulp eol --line-ending "lf"
 *     Enforce lf (\n) line endings.
 */
gulp.task("eol", function(done) {
	// Run yargs.
	var __flags = yargs
		.option("line-ending", {
			alias: "l",
			choices: ["cr", "lf", "crlf", "\r", "\n", "\r\n"],
			type: "string"
		})
		// Reset the line ending.
		.coerce("line-ending", function(value) {
			var lookup = {
				cr: "\r", // Mac OS
				lf: "\n", // Unix/OS X
				crlf: "\r\n" // Windows/DOS
			};

			return lookup[value.toLowerCase()];
		}).argv;

	// Get flag values.
	var ending = __flags.l || __flags["line-ending"] || EOL_ENDING;

	// Check: HTML, CSS, JS, JSON, TXT, TEXT, and MD files. They also
	// exclude files containing a ".min." as this is the convention used
	// for minified files. The node_modules/, .git/, and all vendor/
	// files are also excluded.
	var files = [
		$paths.files_code,
		$paths.not_min,
		bangify($paths.img_source),
		bangify(globall($paths.node_modules_name)),
		bangify(globall($paths.git))
	];

	pump(
		[
			gulp.src(files, {
				dot: true,
				base: $paths.dot
			}),
			$.sort(opts_sort),
			$.eol(ending),
			$.debug.edit(),
			gulp.dest($paths.basedir)
		],
		done
	);
});
