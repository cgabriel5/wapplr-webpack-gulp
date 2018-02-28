/**
 * Indent all JS files with tabs or spaces.
 *
 * • Task is currently experimental.
 * • Ignores ./node_modules/*, ./git/* and vendor/* files.
 *
 * --style [string]
 *     Indent using spaces or tabs. Defaults to tabs.
 *
 * --size [string]
 *     The amount of spaces to use. Defaults to 4.
 *
 * $ gulp indent --style "tabs"
 *     Turn all 4 starting spaces into tabs.
 *
 * $ gulp indent --style "spaces" --size "2"
 *     Expand lines starting with tabs into 2 spaces.
 */
gulp.task("indent", function(done) {
	// Run yargs.
	var __flags = yargs
		.option("style", {
			alias: "s",
			type: "string"
		})
		.option("size", {
			alias: "z",
			type: "number"
		}).argv;

	// Get flag values.
	var style = __flags.style || "tabs";
	var size = __flags.size || 4; // Spaces to use.

	// Print the indentation information.
	print.gulp.info(
		`Using: ${chalk.magenta(style)}. Size: ${chalk.green(size)}.`
	);

	pump(
		[
			gulp.src(
				[
					$paths.files_all.replace(/\*$/, "js"), // Only JS files.
					bangify(globall($paths.node_modules_name)),
					bangify(globall($paths.git)),
					$paths.not_vendor
				],
				{
					base: $paths.base_dot
				}
			),
			$.gulpif(
				// Convert tabs to spaces.
				style === "tabs",
				$.replace(/^( )+/gm, function(match) {
					// Split on the amount size provided.
					// [https://stackoverflow.com/a/6259543]
					var chunks = match.match(new RegExp(`.\{1,${size}\}`, "g"));

					// Modify the chunks.
					chunks = chunks.map(function(chunk) {
						return !(chunk.length % size) ? "\t" : chunk;
					});

					// Join and return new indentation.
					return chunks.join("");
				})
			),
			$.gulpif(
				// Convert spaces to tabs.
				style === "spaces",
				$.replace(/^([\t ])+/gm, function(match) {
					// Replace all tabs with spaces.
					match = match.replace(/\t/g, " ".repeat(size));
					return match;
				})
			),
			gulp.dest("./"),
			$.debug.edit()
		],
		done
	);
});
