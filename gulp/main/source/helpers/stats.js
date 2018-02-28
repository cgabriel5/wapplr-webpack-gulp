/**
 * Print a table containing project file type breakdown.
 *
 * • Depending on project size, task might take time to run.
 *
 * -c, --comprehensive [boolean]
 *     By default all files are checked for. Providing this flag indicates
 *     to use a more comprehensive code file extensions list.
 *
 * -w, --web [boolean]
 *     By default all files are checked for. Providing this flag indicates
 *     to use a exclusive web file extensions list.
 *
 * -l, --list [boolean]
 *     Providing this flag indicates to print the list of file paths.
 *
 * $ gulp stats
 *     Print file type breakdown.
 *
 * $ gulp stats --comprehensive
 *     Print file type breakdown of code files.
 *
 * $ gulp stats --web
 *     Print file type breakdown of common web file types.
 *
 * $ gulp stats --web --list
 *     Print breakdown of common web file types and the file paths.
 */
gulp.task("stats", function(done) {
	var Table = require("cli-table2");

	// Run yargs.
	var __flags = yargs
		.option("comprehensive", {
			alias: "c",
			type: "boolean"
		})
		.option("web", {
			alias: "w",
			type: "boolean"
		})
		.option("list", {
			alias: "l",
			type: "boolean"
		}).argv;

	// Get flag value.
	var comprehensive = __flags.c || __flags.comprehensive;
	var web = __flags.w || __flags.web;
	var list = __flags.l || __flags.list;

	// This is where the used extensions will be stored.
	var extensions = {};
	var filter = "";

	// If flags are provided use them as a filter. Else if flags are not
	// provided include all project files in search.
	if (web || comprehensive) {
		// Prepare the extension types.
		filter =
			'--type="' +
			$paths["files_" + (comprehensive ? "code" : web ? "common" : "")]
				.match(/\{.*\}/)[0]
				.replace(/\{|\}/g, "")
				.replace(/,/g, " ") +
			'"';
	}

	// Run the files task with the type flag from via cmd-node to not
	// repeat the logic again.
	cmd.get(`${GULPCLI} files ${filter}`, function(err, data) {
		if (err) {
			throw err;
		}

		// Get the lines with path files only.
		var files = data.match(/(=>\s+)([^\s]+)(\s)(\d+(.\d+)? \w+)/g);

		// Further clean the output to only get the file paths.
		files = files.filter(function(line) {
			var filepath = line.match(/(=>\s+)([^\s]+)(\s)(\d+(.\d+)? \w+)/)[2];

			// Get the extension type.
			var ext = extension({ path: filepath });

			// Exclude any extension-less files.
			if (!ext) {
				return false;
			}

			// Get the extensions count for the current extension from the
			// extensions object.
			var ext_count = extensions[ext];

			// If a counter does not exist for this extension, start one.
			if (!ext_count) {
				// Does not exist, so start extension count.
				extensions[ext] = 1;
			} else {
				// Already exists just increment the value.
				extensions[ext] = ++ext_count;
			}

			return filepath;
		});

		// Get the files array length.
		var file_count = files.length;

		// Instantiate.
		var table = new Table({
			head: ["Extensions", `Count (${file_count})`, "% Of Project"],
			style: { head: ["green"] }
		});

		// Add the data to the table.
		for (var ext in extensions) {
			if (extensions.hasOwnProperty(ext)) {
				var count = +extensions[ext];
				table.push([
					"." + ext.toLowerCase(), // The extension name.
					count, // The times the extension is used.
					// The % relative to the project the extension is used.
					Math.round(count / file_count * 100)
				]);
			}
		}

		// Sort table descendingly.
		table.sort(function(a, b) {
			return b[2] - a[2];
		});

		// Highlight data string.
		if (list) {
			print(cli_highlight(data));
		}

		print(table.toString());

		done();
	});
});
