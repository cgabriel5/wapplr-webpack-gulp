/**
 * Variables are declared outside of tasks to be able to use them in
 *     multiple tasks. The variables are populated in the tohtml:prepcss
 *     task and used in the tohtml task.
 */
var __markdown_styles;
var __markdown_stopped;

/**
 * Get CSS Markdown and prismjs styles.
 *
 * @internal - Used to prepare the tohtml task.
 */
gulp.task("tohtml:prepcss", function(done) {
	// Run yargs.
	var __flags = yargs.option("file", {
		alias: "F",
		type: "string"
	}).argv;

	// Get flag values.
	var file = __flags.F || __flags.file;

	// Check that the file is a markdown file.
	if (!extension.ismd({ path: file })) {
		print.gulp.warn(
			`.${extension({
				path: file
			})} file was provided.`
		);
		print.gulp.info("Need a .md (Markdown) file.");

		// Set the variable.
		__markdown_stopped = true;

		return done();
	}

	// Run gulp process.
	pump(
		[
			gulp.src(
				[$paths.markdown_styles_github, $paths.markdown_styles_prismjs],
				{
					cwd: $paths.markdown_assets
				}
			),
			// $.debug(),
			$.concat($paths.markdown_concat_name),
			$.modify({
				fileModifier: function(file, contents) {
					// Store the contents in variable.
					__markdown_styles = contents;
					return contents;
				}
			})
			// $.debug.edit()
		],
		done
	);
});

/**
 * Converts Markdown (.md) file to .html.
 *
 * • Files will get placed in ./markdown/previews/.
 *
 * -F, --file <string>
 *     Path of file to convert. Defaults to ./README.md
 *
 * -o, --open [boolean]
 *     Flag indicating whether to open the converted file
 *     in the browser.
 *
 * -l, --linkify [boolean]
 *     Flag indicating whether to convert links to HTTP URLs for previewing
 *     purposes. Again, this is only for development previewing purposes.
 *     This feature comes in handy as the file's output destination is
 *     different than that of the source Markdown file's location source.
 *
 * $ gulp tohtml --file "./README.md"
 *     Convert README.md to README.html.
 *
 * $ gulp tohtml --file "./README.md" --open --linkify
 *     Convert README.md to README.html, open file in browser, and
 *     linkify URLs.
 */
gulp.task("tohtml", ["tohtml:prepcss"], function(done) {
	// Check the tohtml:prepcss variables before the actual task code runs.
	if (__markdown_stopped) {
		return done();
	}

	// Actual task starts here.

	var prism = require("prismjs");
	// Extend the default prismjs languages.
	require("prism-languages");

	// Run yargs.
	var __flags = yargs
		.option("file", {
			alias: "F",
			type: "string"
		})
		.option("open", {
			alias: "o",
			type: "boolean"
		})
		.option("linkify", {
			alias: "l",
			type: "boolean"
		}).argv;

	// Get flag values.
	var file = __flags.F || __flags.file;
	var open = __flags.o || __flags.open;
	var linkify = __flags.l || __flags.linkify;

	// Task logic:
	// - Get file markdown file contents.
	// - Convert contents into HTML via marked.
	// - Inject HTML fragment into HTML markdown template.
	// - Save file in markdown/previews/.

	// Make marked use prism for syntax highlighting.
	// [https://github.com/krasimir/techy/issues/30#issuecomment-238850743]
	$.marked.marked.setOptions({
		highlight: function(code, language) {
			// Default to markup when language is undefined or get an error.
			return prism.highlight(code, prism.languages[language || "markup"]);
		}
	});

	/**
	 * Turn relative links into HTTP URLs
	 *
	 * @param  {string} string - The string content to linkify.
	 * @return {string} - The linkified string.
	 */
	var linkifier = function(string) {
		// URL lookup pattern.
		var pattern = /=("|')((\.\.?)?\/[^/])([^\\]*?)\1/gm;

		return string.replace(pattern, function(match) {
			// Get the quote style (single or double quotes).
			var quote_style = match[match.length - 1];

			// Remove unneeded chars to expose URL.
			match = match.replace(/(^=("|')[\.\/]+|("|')$)/g, "");

			// Create the resource HTTP URL.
			var url = uri({
				appdir: APPDIR,
				filepath: match,
				https: HTTPS
			});

			// Note: The following code is commented out as the utils.uri
			// function seems to handle the link conversion pretty well.
			// If needed to fallback the following code can be used.

			// // Make the path an absolute path.
			// var resolved_path = path.resolve(match);
			// // Although absolute, remove the cwd from the path.
			// resolved_path = path.relative(
			// 	$paths.cwd,
			// 	resolved_path
			// );

			// // Make the URL scheme.
			// var scheme = "http" + HTTPS ? "s://" : "://";

			// // Turn path to an HTTP URL.
			// resolved_path =
			// 	scheme + path.join(APPDIR, resolved_path);

			// // Add the quotes and return.
			// return `=${quote_style}${resolved_path}${quote_style}`;

			return `=${quote_style}${url}${quote_style}`;
		});
	};

	// Get the browser-sync version outside of the Gulp process to only
	// make a single request for it.
	var bs_version = json.read($paths.browser_sync_pkg).data.version;

	// Run gulp process.
	pump(
		[
			gulp.src(file, {
				// Maintain the original directory structure.
				cwd: $paths.dot,
				base: $paths.dot
			}),
			$.debug(),
			$.marked(),
			$.modify({
				fileModifier: function(file, contents) {
					// Path offsets.
					var fpath = "../../favicon/";
					// Get file name + relative file path.
					var filename = path.basename(file.path);
					var filename_rel = path.relative($paths.cwd, file.path);

					// Linkify URLs when the flag is provided.
					if (linkify) {
						contents = linkifier(contents);
					}

					// Where browser-sync script will be contained if
					// a server instance is currently running.
					var bs_script = "";

					// Check internal file for a browser-sync local port.
					var bs_local_port = get(
						$internal.data,
						"process.ports.local"
					);

					// If a browser-sync instance exists we populate the
					// variable with the script injection code.
					if (bs_local_port) {
						bs_script = `<script>
// [https://stackoverflow.com/a/8578840]
(function(d, type, id) {
	var source =
		"//" +
		location.hostname +
		":${bs_local_port}" +
		"/browser-sync/browser-sync-client.js?v=${bs_version}";

	// Create the script element.
	var el = d.createElement(type);
	el.id = id;
	el.type = "text/javascript";
	el.async = true;
	el.onload = function() {
		console.log("BrowserSync loaded.");
	};
	el.src = source;

	// Make it the last body child.
	d.getElementsByTagName("body")[0].appendChild(el);
})(document, "script", "__bs_script__");
</script>`;
					}

					var template_meta = linkifier(`<meta charset="utf-8">
    <meta name="description" content="Markdown to HTML preview.">
    <meta http-equiv="x-ua-compatible" content="ie=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
    <link rel="apple-touch-icon" sizes="180x180" href="${fpath}/apple-touch-icon.png">
    <link rel="icon" type="image/png" sizes="32x32" href="${fpath}/favicon-32x32.png">
    <link rel="icon" type="image/png" sizes="16x16" href="${fpath}/favicon-16x16.png">
    <link rel="manifest" href="${fpath}/manifest.json">
    <link rel="mask-icon" href="${fpath}/safari-pinned-tab.svg" color="#699935">
    <link rel="shortcut icon" href="${fpath}/favicon.ico">
    <meta name="msapplication-TileColor" content="#00a300">
    <meta name="msapplication-TileImage" content="${fpath}/mstile-144x144.png">
    <meta name="msapplication-config" content="${fpath}/browserconfig.xml">
    <meta name="theme-color" content="#f6f5dd">`);
					var template = `<!doctype html>
<html lang="en">
<head>
    <title>${filename}</title>
	${template_meta}
    <!-- https://github.com/sindresorhus/github-markdown-css -->
	<style>${__markdown_styles}</style>
</head>
    <body>
		<h3 class="github-heading">
			<svg aria-hidden="true" class="octicon octicon-book" height="16" version="1.1" viewBox="0 0 16 16" width="16">
				<path fill-rule="evenodd" d="M3 5h4v1H3V5zm0 3h4V7H3v1zm0 2h4V9H3v1zm11-5h-4v1h4V5zm0 2h-4v1h4V7zm0 2h-4v1h4V9zm2-6v9c0 .55-.45 1-1 1H9.5l-1 1-1-1H2c-.55 0-1-.45-1-1V3c0-.55.45-1 1-1h5.5l1 1 1-1H15c.55 0 1 .45 1 1zm-8 .5L7.5 3H2v9h6V3.5zm7-.5H9.5l-.5.5V12h6V3z">
				</path>
			</svg>
			${filename} <span class="github-heading-filepath">&mdash; ./${filename_rel}</span>
		</h3>
		<div class="markdown-body">${contents}</div>
		${bs_script}
	</body>
</html>`;

					// Add browser-sync to the file. Tried to go this route:
					// [Browsersync] Copy the following snippet into your website, just before the closing </body> tag
					// <script id="__bs_script__">//<![CDATA[
					//     document.write("<script async src='http://HOST:3000/browser-sync/browser-sync-client.js?v=2.20.0'><\/script>".replace("HOST", location.hostname));
					// //]]></script>
					// However, I could not get this to work so script was
					// gets created on the fly as shown below.

					return template;
				}
			}),
			$.beautify(JSBEAUTIFY),
			gulp.dest($paths.markdown_preview),
			// Open the file when the open flag is provided.
			$.gulpif(
				open,
				$.modify({
					fileModifier: function(file, contents) {
						// Note: fileModifier is being used here in a 'hacky'
						// way. fileModifier is intended to modify the file's
						// contents. However, the original file contents are
						// being returned. fileModifier in this case is being
						// used as a callback function to run the open task
						// as a shell command.

						// Get the converted HTML file name.
						var filename_rel = path.relative($paths.cwd, file.path);

						// Run the open task as a shell command to not
						// re-write the task logic.
						cmd.get(
							`${GULPCLI} open --file ${filename_rel}`,
							function(err) {
								if (err) {
									throw err;
								}
							}
						);

						return contents;
					}
				})
			),
			$.debug.edit(),
			__bs.stream()
		],
		done
	);
});
