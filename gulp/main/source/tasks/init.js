/**
 * When Gulp is closed, either on error, crash, or intentionally, do
 *     a quick cleanup.
 */
var cleanup = require("node-cleanup");
cleanup(function(exit_code, signal) {
	// Is alphabetize really needed for an internal file?
	var alphabetize = require("alphabetize-object-keys");

	// The purpose of this cleanup is to cleanup the internal settings
	// file. This code will run when the current Gulp instance is closed
	// for whatever reason. When the process ID matches that of the stored
	// PID then the file will get cleared. Non-matching PIDs will not
	// cause any cleanup, as they should not.

	// Termination signal explanation: [https://goo.gl/rJNKNZ]

	// Re-read the file to get the most current value.
	$internal = json.read($paths.config_internal);
	INT_PROCESS = get($internal.data, "process", "");
	INT_PID = get(INT_PROCESS, "pid", "");

	// If the process is closed and it matches the recorded PID it is
	// the original process so close it and clear the internal file.
	if (INT_PID && INT_PID === process.pid) {
		// Don't call cleanup handler again.
		cleanup.uninstall();

		// Note: Remove markdown previews to keep things clean but also due
		// to changed port numbers. Some previews might contain old instance
		// browser-sync port numbers. Resulting in an console error. Though
		// nothing major as the HTML file will still load this just prevents
		// this issue.
		del.sync([
			globall($paths.markdown_preview),
			bangify($paths.markdown_preview)
		]);

		// When closed due to an error give an error message & notification.
		if (exit_code) {
			var message = `Error caused instance ${chalk.green(
				process.pid
			)} to close.`;
			notify(message, true);
			print.gulp.error(message);
		} else {
			// Else simply show that the process was successfully stopped.
			print.gulp.success(
				`Gulp instance ${chalk.green(process.pid)} stopped.`
			);
		}

		// Clear stored internal process values.
		$internal.set("process", null);
		$internal.data = alphabetize($internal.data);
		$internal.writeSync(null, JINDENT);

		// Cleanup other variables.
		__branch_name = undefined;
		// Close the webpack watching instance if running.
		if (__watching && __watching.close) {
			__watching.close(function() {
				print.gulp.success("Closed webpack watcher.");
			});
		}
		// Close the webpack dev server instance if running.
		if (__server && __server.close) {
			__server.close(function() {
				print.gulp.success("Closed webpack watcher.");
			});
		}

		// Finally kill the process.
		process.kill(INT_PID, signal);

		return false;
	}
});

/**
 * Store current process information in internal config. file.
 *
 * • This will write current process information to an internal gulp
 *     configuration file. This is done to prevent multiple Gulp
 *     instances from being spawned. Only one can be made at a time.
 *
 * @internal - Used with the default task.
 */
gulp.task("init:save-pid", function(done) {
	// Set the process information.
	$internal.set("process.pid", process.pid);
	$internal.set("process.title", process.title);
	$internal.set("process.argv", process.argv);
	$internal.set("process.mode", __mode);

	// Store and save changes to file.
	$internal.write(
		function() {
			done();
		},
		null,
		JINDENT
	);
});

/**
 * Watch for Git branch changes.
 *
 * • Branch name checks are done to check whether the branch was changed
 *     after the Gulp instance was made. When switching branches files
 *     and file structure might be different. This can cause problems
 *     like making performing unnecessary tasks calls. Therefore, after
 *     making a branch change simply restart Gulp. This is something that
 *     needs to be made seamless.
 *
 * @internal - Used with the default task.
 */
gulp.task("init:watch-git-branch", function(done) {
	var git = require("git-state");

	git.isGit($paths.dirname, function(exists) {
		// If no .git/ exists simply ignore and return done.
		if (!exists) {
			return done();
		}

		// Else it does exist so continue.
		git.check($paths.dirname, function(err, result) {
			if (err) {
				throw err;
			}

			// Record branch name.
			__branch_name = result.branch;

			// Create a Gulp watcher as .git/ exists.
			gulp.watch(
				[$paths.githead],
				{
					cwd: $paths.basedir,
					dot: true
				},
				function() {
					// Get the branch name.
					var brn_current = git.checkSync($paths.dirname).branch;

					// Print the branch name being watched.
					if (__branch_name) {
						print.gulp.info(
							"Gulp is monitoring branch:",
							chalk.magenta(__branch_name)
						);
					}

					// When the branch names do not match a switch was made.
					// Print some messages and exit the process.
					if (brn_current !== __branch_name) {
						// message + exit
						print.gulp.warn(
							"Gulp stopped due to a branch switch.",
							`(${__branch_name} => ${chalk.magenta(
								brn_current
							)})`
						);
						print.gulp.info(
							"Restart Gulp to monitor",
							chalk.magenta(brn_current),
							"branch."
						);

						process.exit();
					}
				}
			);

			done();
		});
	});
});

/**
 * Start the webpack instance/server.
 *
 * @internal - Used with the default task.
 */
gulp.task("init:webpack", function(done) {
	var webpack = require("webpack");
	var webpack_devserver = require("webpack-dev-server");
	var config = require("./configs/webpack.config.js");
	var browser_sync_plugin = require("browser-sync-webpack-plugin");

	// Print the mode that webpack is running in.
	print.gulp.info(`Running in ${chalk.gray(__mode)} mode.`);

	// Get the ports.
	var __ports = __bs.__ports;
	// If the ports are not set in the init task then set them to a string
	// and check again after combining the config options with the defaults.
	if (!__ports) {
		__ports = ["APP", "UI", "WEBPACK"];
	}

	// Get the proxy port.
	var proxy_port = __ports[2];

	// The default Browser-Sync options. Overwrite any options by using
	// the ./configs/browsersync.json file. Anything in that file will
	// overwrite the defaults.
	var __bs_options_server = Object.assign(
		// The default options.
		// [https://gist.github.com/christopher4lis/3358d92395d686375c50f7ebb218f1dc]
		{
			host: "localhost",
			browser: browser,
			proxy: uri({
				appdir: APPDIR,
				filepath: INDEX,
				https: HTTPS
			}),
			proxy:
				__mode === "server"
					? `localhost:${proxy_port}`
					: uri({
							appdir: APPDIR,
							filepath: "dist/" + INDEX,
							https: HTTPS
						}),
			port: __ports[0],
			ui: {
				port: __ports[1]
			},
			notify: false,
			open: true,
			logPrefix: "BS",
			name: get(BROWSERSYNC, "name", "")
		},
		// Custom options.
		BROWSERSYNC.plugin
	);

	// Check if the settings need to be cleared to only use the config
	// file provided settings.
	if (get(BROWSERSYNC, "clear", "")) {
		// Reset the options variable to only contain the config file
		// settings.
		__bs_options_server = BROWSERSYNC.plugin;

		// If the options object is empty give a warning.
		if (!Object.keys(__bs_options_server).length) {
			print.gulp.warn("No options were supplied to BrowserSync.");
		}
	}

	// Note: If no ports are found then remove the keys from the object.
	// When they are left to be "APP", "UI" lets us know that they were
	// not set or else they would be something else. However, leaving
	// them as anything but a number will cause browser-sync to throw an
	// error. This is why they are removed below. This will leave
	// browser-sync to find ports instead.
	if (get(__bs_options_server, "port", "") === "APP") {
		delete __bs_options_server.port;
	}
	if (get(__bs_options_server, "ui.port", "") === "UI") {
		delete __bs_options_server.ui.port;
	}

	var __bs_options_plugin = {
		// Prevent BrowserSync from reloading the page and let Webpack
		// Dev Server take care of this.
		reload: !(__mode === "server"),
		name: "BS"
	};

	// Reset the browser-sync callback function.
	__bs_options_plugin.callback = function() {
		// // Tab into the browser-sync socket instance.
		// __bs.sockets.on("connection", function(socket) {
		// 	print("Server browser-sync socket.io connected.");

		// 	// Send custom event.
		// 	// __bs.sockets.emit("wapplr:get-url");

		// 	// Listen to custom event from the client.
		// 	socket.on("wapplr:url", function(data) {
		// 		console.log("got wapplr:get-url");

		// 		var url = require("url-parse");
		// 		var parsed = new url(data.url);

		// 		// print(parsed);
		// 		// Run URL checks here..
		// 		setTimeout(function() {
		// 			print("Reloading...");
		// 			__bs.reload();
		// 		}, 3000);
		// 	});
		// });

		// Gulp watcher paths.
		var watch_paths = BUNDLE_GULP.watch;

		// Watch for any changes to config files.
		$.watcher.create("watcher:settings", watch_paths.config, ["settings"]);
	};

	// Reset the browser-sync options.
	__bs = new browser_sync_plugin(__bs_options_server, __bs_options_plugin);

	// Browser-sync plugins aren't too well documented. These resources
	// are enough to get things going and understand how to write one.
	// [https://www.npmjs.com/package/browser-sync-close-hook]
	// [https://github.com/BrowserSync/browser-sync/issues/84]
	// [https://gist.github.com/shakyShane/3d5ec6685e07fd3227ba]
	// [https://gist.github.com/timthez/d1b29ea02cce7a2a59ff]
	// [https://gist.github.com/timthez]
	// [https://browsersync.io/docs/options#option-plugins]
	// [https://github.com/BrowserSync/browser-sync/issues/662]
	// [https://github.com/BrowserSync/browser-sync/issues/952]
	// [https://github.com/shakyShane/html-injector/blob/master/client.js]
	// [https://github.com/shakyShane/html-injector/blob/master/index.js]

	// Plugin: Add auto tab closing capability to browser-sync when the
	// auto close tabs flag is set. Basically, when the browser-sync server
	// closes all the tabs opened by browser-sync or the terminal will be
	// auto closed. Tabs that are created manually (i.e. copy/pasting URL
	// or typing out URL then hitting enter) cannot be auto closed due to
	// security issues as noted here: [https://stackoverflow.com/q/19761241].
	if (get(BROWSERSYNC, "auto_close_tabs", "")) {
		__bs.browserSync.use({
			plugin: function() {}, // Function does nothing but is needed.
			hooks: {
				"client:js": bs_autoclose
			}
		});
	}

	// // Plugin: Hook into the browser-sync socket instance to be able to
	// // reload by checking the window's URL.
	// __bs.browserSync.use({
	// 	plugin: function() {},
	// 	hooks: {
	// 		"client:js": fs.readFileSync(
	// 			"./gulp/assets/browser-sync/plugin-url-reload.js",
	// 			"utf-8"
	// 		)
	// 	}
	// });

	// Finally, add the plugin to the config.plugins array.
	config.plugins.unshift(__bs);

	// Note: To prevent the Gulp done() callback from executing more than
	// once this flag is used. On webpack server/watcher initiation the flag
	// is turned on. When files are changed the callback seems to fire. This
	// also causes the callback to fire. When the callback fires more than
	// once Gulp throws an error (Error: task completion callback called
	// too many times) which is why this flag is needed.
	var is_complete = false;

	// Webpack configuration: [https://webpack.js.org/configuration/]
	var compiler = webpack(config, function(err, stats) {
		// Handle errors according to the documentation:
		// [https://webpack.js.org/api/node/#error-handling]
		if (err) {
			console.error(err.stack || err);
			if (err.details) {
				console.error(err.details);
			}
			return done();
		}

		// Convert the stats object to a string and add CLI coloring.
		// [https://webpack.js.org/api/node/#stats-tostring-options-]
		var info = stats.toString({ colors: true });

		// If there are any errors print them.
		if (stats.hasErrors()) {
			console.error(info.errors);
		}
		// If there are any warnings print them.
		if (stats.hasWarnings()) {
			console.warn(info.warnings);
		}

		// Run the specific action depending on the environment variable set.

		if (__mode === "production") {
			// Just run the compiler instance.
			compiler.run(function(err, stats) {
				done();
				process.exit();
			});
		} else if (__mode === "development") {
			// The watch options:
			// [https://webpack.js.org/configuration/watch/#watchoptions]
			__watching = compiler.watch(
				{
					ignored: /node_modules/
				},
				function(err, stats) {
					if (!is_complete) {
						is_complete = true;
						done();
					}
					is_complete = true;
				}
			);
		} else if (__mode === "server") {
			// Get the webpack config entries.
			var entries = config.entry;

			// Loop over all the entries to add hot module replacement and
			// inline mode.
			for (var entry in entries) {
				if (entries.hasOwnProperty(entry)) {
					entries[entry].unshift(
						`webpack-dev-server/client?http://localhost:${proxy_port}/`,
						"webpack/hot/dev-server"
					);
				}
			}

			// Create the webpack dev server.
			// [https://github.com/webpack/docs/wiki/webpack-dev-server#api]
			__server = new webpack_devserver(compiler, {
				historyApiFallback: true,
				clientLogLevel: "error",
				stats: { colors: true },
				contentBase: "src/",
				publicPath: "/",
				compress: true,
				quiet: false,
				noInfo: true
				// Note: Adding the hot key in this confg object will cause
				// hot module replacement to not work. Instead use the webpack
				// HMR plugin in the webpack.config file.
				// [https://github.com/webpack/webpack/issues/1151#issuecomment-290962847]
				// hot: true
			});

			// Listen to the server.
			__server.listen(proxy_port, "localhost", function() {
				if (!is_complete) {
					is_complete = true;
					done();
				}
				is_complete = true;
			});
		}
	});
});

/**
 * Variables are declared outside of tasks to be able to use them in
 *     multiple tasks. The variables are populated in the
 *     default:active-pid-check task and used in the default task.
 */
var __process_exists;
var __process_stopped;

/**
 * Check for an active Gulp process before making another.
 *
 * @internal - Used with the default task.
 */
gulp.task("default:active-pid-check", function(done) {
	// Run yargs.
	var __flags = yargs.argv;

	// When the --stop flag is provided the Gulp instance must be stopped.
	if (__flags.stop) {
		// Set the task variable to true.
		__process_stopped = true;

		if (INT_PID) {
			// Kill the Gulp instance.
			print.gulp.success(
				`Gulp instance ${chalk.green(INT_PID)} stopped.`
			);
			process.kill(INT_PID);
		} else {
			// No open process exists so simply print out a message.
			print.gulp.warn("No Gulp process exists.");
		}

		return done();
	}

	// If a PID is stored it means a Gulp instance has already started
	// or the file was not cleared properly. This task will help determine
	// which case of the two it is.

	var find = require("find-process");

	// If no stored PID simply continue. No stored PID means there is
	// no active running gulp instance so continue the task normally
	// to create the Gulp instance.
	if (!INT_PID) {
		return done();
	} else {
		// Else if a PID exists determine if its active and a Gulp process.

		// Get the process information using the stored PID.
		find("pid", INT_PID).then(
			function(processes) {
				// This module will return an array containing the found
				// process in objects. Because we are supplying it the
				// PID the array will only return 1 object if the process
				// exists.

				// Get the process.
				var p = processes[0];

				// If no process exists then the process with the stored PID
				// does not exist and so we can proceed to the next task to
				// create a new instance.
				if (!p) {
					return done();
				}

				// When a process does exist then the following have to match
				// to make sure the process is legit. In other words if they
				// match then the process exists. An existing process will
				// prevent making other processes.
				// To-Do: Make this check better in the future.
				if (p.cmd === INT_TITLE && p.name.toLowerCase() === "gulp") {
					// A process exists so store the process information
					// to access it in the following task.
					__process_exists = p;
				}

				return done();
			},
			function(err) {
				if (err) {
					throw err;
				}
			}
		);
	}
});

/**
 * Runs Gulp.
 *
 * • This is the default task that will build project files, watch files,
 *     run browser-sync, etc.
 * • Only one instance can be run at a time.
 *
 * -s, --stop [boolean]
 *     Flag indicating to stop Gulp.
 *
 * -p, --ports [string]
 *     The ports for browser-sync to use. Ports must be provided in the
 *     following format: "local-port:ui-port". Some valid examples are
 *     "3000:3001", "3000:", "3000", and  ":3001". Provided ports must
 *     obviously not be in use. When ports are provided empty ports are
 *     found and passed to browser-sync.
 *
 * $ gulp
 *     Run Gulp.
 *
 * $ gulp --stop
 *     If running, stops the active Gulp process.
 *
 * $ gulp --ports "3000:3001"
 *     Open BrowserSync server on port 3000 and UI on port 3001.
 *
 * @internal - Set as internal to hide from default help output.
 */
gulp.task("default", ["default:active-pid-check"], function(done) {
	// Check the default:active-pid-check variables before the actual
	// task code runs.

	// When the --stop flag is provided do not let the task run.
	if (__process_stopped) {
		return done();
	}

	// As only one Gulp instance is allowed return if a process exists.
	if (__process_exists) {
		print.gulp.warn(
			`Gulp process ${chalk.green(__process_exists.pid)}`,
			"is running. Stop it before starting a new one."
		);
		print.gulp.info(
			"Stop current instance by running: $ gulp settings --rebuild"
		);

		return done();
	}

	// Actual task starts here.

	var find_free_port = require("find-free-port");

	var __flags = yargs
		.option("ports", {
			alias: "p",
			type: "string"
		})
		.coerce("ports", function(opt) {
			// Remove all but non numbers and colons (:).
			opt = opt.replace(/[^\d:]/g, "");
			// Split ports by the colon.
			return opt.split(":");
		})
		.option("mode", {
			alias: "m",
			type: "string"
		}).argv;

	// Get the values.
	var ports = __flags.p || __flags.ports;

	// Capture the mode.
	__mode = __flags.m || __flags.mode;
	// The possible modes to use.
	var modes = {
		d: "development",
		p: "production",
		s: "server"
	};
	// Determine the environment variable from the possible modes.
	__mode = modes[__mode.toLowerCase()];
	// If the provided mode does not exist default to development mode.
	if (!__mode) {
		__mode = modes["d"];
	}
	// Set the environment variable.
	process.env["NODE_ENV"] = __mode;

	// Find free ports to open browser-sync on.
	new Promise(function(resolve, reject) {
		// Find two free ports in case ports are not provided via CLI.
		find_free_port(
			$configs.findfreeport.range.start,
			$configs.findfreeport.range.end,
			$configs.findfreeport.ip,
			$configs.findfreeport.count,
			function(err) {
				// Ports are in this order: p1:local, p2:UI, p3:webpack.
				if (err) {
					reject(err);
				}

				// Reset the ports (local, UI, webpack) when ports are
				// provided via the CLI.
				if (ports) {
					// Reset the port values.
					for (var i = 1, l = arguments.length; i < l; i++) {
						// Get the argument and port.
						var argument = arguments[i];
						var port = ports[i - 1];

						// There must be a port to make the change.
						if (port) {
							arguments[i] = port * 1;
						}
					}
				}

				// Resolve the promise and return the ports.
				resolve([arguments[1], arguments[2], arguments[3]]);
			}
		);
	})
		.then(function(ports) {
			// Get the ports.
			var p1 = ports[0];
			var p2 = ports[1];
			var p3 = ports[2];

			// Store the ports.
			$internal.set("process", {
				ports: {
					local: p1,
					ui: p2,
					webpack: p3
				}
			});

			// Save ports.
			$internal.write(
				function() {
					// Store ports on the browser-sync object itself.
					__bs.__ports = [p1, p2, p3]; // [app, ui, webpack]

					// After getting the free ports run the build task.
					return sequence(
						"init:save-pid",
						"init:watch-git-branch",
						function() {
							// Pretty files before working on them for
							// the first time.
							cmd.get(`${GULPCLI} pretty -q`, function(
								err,
								data
							) {
								if (err) {
									throw err;
								}

								// Highlight data string.
								print(cli_highlight(data));

								// Finally, start webpack.
								return sequence("init:webpack", function() {
									done();
								});
							});
						}
					);
				},
				null,
				JINDENT
			);
		})
		.catch(function(err) {
			if (err) {
				throw err;
			}

			done();
		});
});
