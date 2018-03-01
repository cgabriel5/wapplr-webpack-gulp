// Programmatically rebuild internal file when it does not exist.
if (!fe.sync($paths.config_internal)) {
	fs.writeFileSync($paths.config_internal, "{}");
}

// Dynamic configuration files (load via json-file to modify later).
var $internal = json.read($paths.config_internal);

// Object will contain all the configuration settings.
var $configs = {};

// Settings configuration file must exist to populate the configs object.
if (fe.sync($paths.config_settings)) {
	// Static configuration files (just need to read file).
	var $settings = jsonc.parse(
		fs.readFileSync($paths.config_settings).toString()
	);

	// configuration files must match this pattern.
	var pattern = /^config_\$[a-z_.]+$/i;

	// Get individual plugin settings and store in an object.
	for (var $config in $paths) {
		// Path must match the following pattern to be a config path.
		if ($paths.hasOwnProperty($config) && pattern.test($config)) {
			// Remove any file name sub-extensions. For example,
			// turn "csslint.cm" to "csslint".
			var config_name = $paths[$config].split(".")[0];

			// Get the config settings and add to the settings object.
			$configs[config_name] = $settings[$paths[$config]];
		}
	}
} else {
	// Run yargs.
	var __flags = yargs.argv;

	// Note: When the settings file is missing this error message will get
	// shown. Follow the rebuild command and the file will get rebuilt. The
	// code is only allowed to run when the rebuild flag is set.

	if (!__flags.rebuild || !-~__flags._.indexOf("settings")) {
		// Settings file does not exist so give a message and exit process.
		print.gulp.error(
			chalk.magenta($paths.config_settings),
			"is missing (settings file)."
		);
		print.gulp.info(
			"Rebuild file by running:",
			"$ gulp settings --rebuild"
		);

		process.exit();
	}
}
