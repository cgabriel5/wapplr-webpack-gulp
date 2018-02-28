/**
 * Lint a CSS file.
 *
 * -F, --file <array>
 *     The CSS file to lint.
 *
 * $ gulp lintcss --file ./css/bundles/vendor.css
 *     Lint ./css/bundles/vendor.css.
 */
gulp.task("lintcss", function(done) {
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
			$.csslint($configs.csslint),
			// Note: Avoid implementing a csslint custom reporter as the
			// reporter does not fire when there are no errors/warnings
			// found. In the case that nothing is found it is nice to sill
			// print a message showing that nothing was found. As most
			// reporters just attach the information to the vinyl file
			// object the gulp-fn plugin is used to grab the attached
			// information and run the custom reporter logic.
			$.fn(function(file) {
				// Array will contain the standardized issues.
				var issues_std = [];

				// Only if there were issues found.
				if (!file.csslint.success) {
					// Get the issues.
					var issues = file.csslint.report.messages;

					// Loop over the issues to standardized.
					issues.forEach(function(issue) {
						// Add the standardized issue to the array.
						issues_std.push([
							issue.line,
							issue.col,
							issue.rule.id,
							issue.message
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
