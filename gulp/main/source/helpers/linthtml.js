/**
 * Lint a HTML file.
 *
 * -F, --file <array>
 *     The HTML file to lint.
 *
 * $ gulp linthtml --file ./index.html
 *     Lint ./index.html.
 */
gulp.task("linthtml", function(done) {
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

	pump(
		[
			gulp.src(file, {
				cwd: $paths.basedir
			}),
			$.debug({ loader: false }),
			// Note: Avoid implementing a htmllint reporter to match the
			// csslint reporter implementation. gulp-htmllint attaches a
			// htmllint result object to the vinyl file object containing
			// information about the linting. The gulp-fn plugin is then
			// used to grab the attached information and run the custom
			// reporter logic.
			$.htmllint({ rules: $configs.htmllint }, $.noop),
			$.fn(function(file) {
				// Array will contain the standardized issues.
				var issues_std = [];

				// Only if there were issues found.
				if (!file.htmllint.success) {
					// Get the issues.
					var issues = file.htmllint.issues;

					// Loop over the issues to standardized.
					issues.forEach(function(issue) {
						// Make sure the first letter is always capitalized.
						var first_letter = issue.msg[0];
						issue.msg =
							first_letter.toUpperCase() + issue.msg.slice(1);

						// Add the standardized issue to the array.
						issues_std.push([
							issue.line,
							issue.column,
							issue.code,
							issue.msg
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
