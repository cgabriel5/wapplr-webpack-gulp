/**
 * Opens provided file in browser.
 *
 * • Tabs should be opened using the terminal via this task. Doing
 *   so will ensure the generated tab will auto-close when Gulp is
 *   closed. Opening tabs by typing/copy-pasting the project URL
 *   into the browser address bar will not auto-close the tab(s)
 *   due to security issues as noted here:
 *   [https://stackoverflow.com/q/19761241].
 *
 * -F, --file <file>
 *     The path of the file to open.
 *
 * -p, --port [number]
 *     The port to open in. (Defaults to browser-sync port if
 *     available or no port at all.)
 *
 * -d, --directory [string]
 *     The directory path to open in a file manager.
 *
 * -e, --editor [string]
 *     The file path to open in the user's text editor to edit.
 *
 * -w, --wait [boolean]
 *     To be Used with the -e/--editor flag. If provided the
 *     editor will wait to close and will only close manually (i.e.
 *     close the editor or exit the terminal task).
 *
 * -l, --line [number]
 *     To be used with -e/--editor flag. Open the file at the
 *     provided line.
 *
 *-c,  --column [number]
 *     To be used with -e/--editor flag. Open the file at the
 *     provided column.
 *
 * -u, --use [string]
 *     To be used with -e/--editor flag. Manually set the editor
 *     to use. Will default to the user's default editor via
 *     ($EDITOR/$VISUAL) environment variables.
 *
 * $ gulp open --file index.html --port 3000
 *     Open index.html in port 3000.
 *
 * $ gulp open --file index.html
 *     Open index.html in browser-sync port is available or no port.
 *
 * $ gulp open --editor ./index.html --wait --line 12 --column 20 --use atom
 *     Open "./index.html" using the text editor Atom if available.
 *     Set the line to 12 and column 20. Use the --wait flag to close
 *     the process after the editor is close or the process is killed via
 *     the terminal.
 *
 * $ gulp open --directory .
 *     Open the root directory in a file manager.
 *
 * $ gulp open --directory ./docs
 *     Open the docs directory in a file manager.
 *
 * $ gulp open --directory docs/subextensions.md
 *     When a file is provided along with the directory, only the directory
 *     section of the path will be used to try and open in a file manager.
 */
gulp.task("open", function(done) {
	// Cache task.
	var task = this;

	// Variables.
	var __flags;

	// Run yargs.
	__flags = yargs
		.option("directory", {
			alias: "d",
			type: "string"
		})
		.option("editor", {
			alias: "e",
			type: "string"
		}).argv;

	// Get flag values.
	var directory = __flags.d || __flags.directory;
	var editor = __flags.e || __flags.editor;

	// If the directory flag is provided open directory in a file manager.
	if (directory) {
		// Parse the directory.
		var parts = path.parse(directory);

		if (!parts.ext) {
			// No file was passed in so reset the directory.
			directory = parts.dir + "/" + parts.base + "/";
		} else {
			// If a file is passed only get the directory part.
			directory = parts.dir + "/";
		}

		// Make the path absolute and relative to the main project root.
		directory = path.join("./", directory);

		// Check that the directory exists.
		if (!de.sync(directory)) {
			print.gulp.warn(
				"The directory",
				chalk.magenta(directory),
				"does not exist."
			);
			return done();
		}

		// Else the directory exists so open the file manager.
		require("opener")(directory, function() {
			done();
		});
	} else if (editor) {
		// If the editor flag is provided open the given file in the user's
		// default editor.

		var spawn = require("child_process").spawn;

		// Check that the file exists.
		if (!fe.sync(editor)) {
			print.gulp.warn(
				"The file",
				chalk.magenta(directory),
				"does not exist."
			);
			return done();
		}

		// Run yargs.
		__flags = yargs
			.option("wait", {
				alias: "w",
				type: "boolean"
			})
			.option("line", {
				alias: "l",
				type: "number"
			})
			.option("column", {
				alias: "c",
				type: "number"
			})
			.option("use", {
				alias: "u",
				type: "string"
			}).argv;

		// Get flag values.
		var wait = __flags.w || __flags.wait;
		var line = __flags.l || __flags.line;
		var column = __flags.c || __flags.column;
		var use_editor = __flags.u || __flags.use;

		// Get user's editor/flags needed to open file via the terminal.
		// Note: The editor variable here is being reused. This is alright
		// as it gets passed into the function before being overwritten.
		editor = get_editor({
			file: {
				name: editor,
				line: line,
				column: column
			},
			editor: use_editor
		});

		// Create the child process to open the editor.
		var child_process = spawn(editor.command, editor.flags, {
			stdio: "inherit",
			detached: true
		});

		// If an error occurs throw it.
		child_process.on("error", function(err) {
			if (err) {
				throw err;
			}
		});

		// If the wait flag is provided make the process hold until the
		// user closes the file or the terminal process is ended manually.
		if (wait) {
			// Once the file is closed continue with the task...
			child_process.on("exit", function() {
				done();
			});
		} else {
			// Else close the process immediately.
			child_process.unref();
			return done();
		}
	} else {
		// Else open the file in a browser. Which is what this task was
		// originally set out to do.

		// Run yargs.
		__flags = yargs
			.option("file", {
				alias: "F",
				type: "string",
				demandOption: true
			})
			.option("port", {
				alias: "p",
				type: "number"
			}).argv;

		// Get flag values.
		var file = __flags.F || __flags.file;

		// Check for explicitly provided port. If none is provided check
		// the internally fetched free ports and get the local port.
		var port =
			__flags.p ||
			__flags.port ||
			(
				INT_PORTS || {
					local: null
				}
			).local;

		// Note: When running in production mode their should a port should
		// not be passed to the uri function builder as there is no server
		// running. The following code resolves the issue by checking the
		// internal settings file for the current mode.

		// Re-read the file to get the most current value.
		$internal = json.read($paths.config_internal);
		var INT_PROCESS = get($internal.data, "process", "");
		var INT_MODE = get(INT_PROCESS, "mode", "");
		// Reset the port if in production mode.
		if (INT_MODE && INT_MODE === "production") {
			port = null;
		}

		// Open the file in the browser.
		return open_file_in_browser(file, port, done, task);
	}
});
