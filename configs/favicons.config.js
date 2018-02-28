module.exports = {
	// Your source logo.
	logo: "./src/favicon/leaf-900.png",
	// The prefix for all image files (might be a folder or a name).
	prefix: "favicons-[hash]/",
	// Emit all stats of the generated icons.
	emitStats: false,
	// The name of the json containing all favicon information.
	statsFilename: "faviconstats-[hash].json",
	// Generate a cache file with control hashes and don't rebuild the favicon
	// until those hashes change.
	persistentCache: true,
	// Inject the html into the html-webpack-plugin.
	inject: true,
	background: "#f6f5dd",
	theme_color: "#699935",
	icons: {
		android: true,
		appleIcon: true,
		appleStartup: true,
		coast: true,
		favicons: true,
		firefox: true,
		opengraph: true,
		twitter: true,
		yandex: true,
		windows: true
	}
};
