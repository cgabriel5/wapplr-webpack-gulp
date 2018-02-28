/**
 * Build gulpfile from source files.
 *
 * $ gulp make
 *     Build gulpfile.
 */
gulp.task("make", function(done) {
	// Get file names to use.
	var names = BUNDLE_GULP.source.names;
	var name_default = names.default;
	var name_main = names.main;

	pump(
		[
			gulp.src(BUNDLE_GULP.source.files, {
				cwd: $paths.gulp_source
			}),
			$.debug(),
			$.foreach(function(stream, file) {
				// The max length of characters for decoration line.
				var max_length = 80;
				var decor = "// " + "-".repeat(max_length - 3);

				var filename = path.basename(file.path);
				var filename_rel = path.relative($paths.cwd, file.path);

				var line_info = `${decor}\n// ${filename} -- ./${filename_rel}\n${decor}\n\n`;

				return stream.pipe($.insert.prepend(line_info));
			}),
			// If gulpfile.js exists use that name else fall back to
			// gulpfile-main.js.
			$.gulpif(
				fe.sync($paths.basedir + name_default),
				$.concat(name_default),
				$.concat(name_main)
			),
			$.prettier(PRETTIER),
			gulp.dest($paths.basedir),
			$.debug.edit()
		],
		done
	);
});
