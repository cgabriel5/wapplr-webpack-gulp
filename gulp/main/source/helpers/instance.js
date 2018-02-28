/**
 * Print whether there is an active Gulp instance.
 *
 * $ gulp status
 *     Print Gulp status.
 */
gulp.task("status", function(done) {
	print.gulp.info(
		INT_PID
			? `Gulp instance running. Process ${chalk.green(INT_PID)}.`
			: "Gulp is not running."
	);
	done();
});

/**
 * Print the currently used ports by browser-sync.
 *
 * $ gulp ports
 *     Print uses ports.
 */
gulp.task("ports", function(done) {
	// No ports are in use so return and print message.
	if (!INT_PORTS) {
		print.gulp.info("No ports are in use.");
		return done();
	}

	// Ports exist.
	print.gulp.info(
		`Local: ${chalk.green(INT_PORTS.local)}, UI: ${chalk.green(
			INT_PORTS.ui
		)}`
	);
	done();
});
