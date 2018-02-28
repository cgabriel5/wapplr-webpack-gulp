/**
 * Build ./configs/.__settings.json
 *
 * --rebuild [boolean]
 *     Flag is used to rebuild the combined config file when it was
 *     deleted for example. The gulpfile needs this file and this
 *     will force its re-build when it gets deleted for whatever reason.
 *
 * $ gulp settings
 *     Build the settings file.
 *
 * $ gulp settings --rebuild
 *     Force settings file re-build when the file gets deleted for
 *     whatever reason.
 */
gulp.task("settings", function(done) {
	// Pause the watcher to prevent infinite loops.
	$.watcher.pause("watcher:settings");

	pump(
		[
			gulp.src($paths.config_settings_json_files, {
				cwd: $paths.basedir
			}),
			$.debug(),
			$.strip_jsonc(), // Remove any json comments.
			$.jsoncombine($paths.config_settings_name, function(data) {
				return new Buffer(JSON.stringify(data, null, JINDENT));
			}),
			gulp.dest($paths.config_home),
			$.debug.edit()
		],
		function() {
			// Un-pause and re-start the watcher.
			$.watcher.start("watcher:settings");

			done();
		}
	);
});
