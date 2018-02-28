(function(window, bs) {
	// Cache the socket instance.
	var socket = bs.socket;

	// Listen to when the socket connects.
	socket.on("connection", function(data) {
		console.log("Client browser-sync socket.io connected.");

		// Add socket listener for our custom event.
		socket.on("wapplr:get-url", function(data) {
			console.log("sent wapplr:get-url");

			// Send the URL to server.
			socket.emit("wapplr:url", {
				url: window.location.href
			});
		});
	});
})(window, window.___browserSync___);
