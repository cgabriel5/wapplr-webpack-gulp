/**
 * Lint a JS file.
 *
 * -F, --file <array>
 *     The JS file to lint.
 *
 * $ gulp lintjs --file ./gulpfile.js
 *     Lint ./gulpfile.js.
 */
gulp.task("lintjs", function(done) {
	// Run yargs.
	var __flags = yargs.option("file", {
		alias: "F",
		type: "array"
	}).argv;

	// Get flag values.
	var file = __flags.F || __flags.file;

	// When no files are provided print an error.
	if (!file.length) {
		print.gulp.error("Provide a file to lint.");
		return done();
	}

	// Don't search for a config file. A config object will be supplied.
	$.jshint.lookup = false;

	pump(
		[
			gulp.src(file, {
				cwd: $paths.basedir
			}),
			$.debug({ loader: false }),
			$.jshint($configs.jshint),
			// Note: Avoid implementing a jshint reporter to match the
			// csslint reporter implementation. gulp-jshint attaches a
			// 'jshint' result object to the vinyl file object containing
			// information about the linting. The gulp-fn plugin is then
			// used to grab the attached information and run the custom
			// reporter logic.
			$.fn(function(file) {
				// Array will contain the standardized issues.
				var issues_std = [];

				// Only if there were issues found.
				if (!file.jshint.success) {
					// Get the issues.
					var issues = file.jshint.results;

					// Loop over the issues to standardized.
					issues.forEach(function(issue) {
						// Add the standardized issue to the array.
						issues_std.push([
							issue.error.line,
							issue.error.character,
							issue.error.code,
							issue.error.reason
						]);
					});
				}

				// Pretty print the issues.
				lint_printer(issues_std, file.path);
			})
		],
		done
	);
});
