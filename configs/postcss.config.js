// Get the individual configuration files for the needed plugins.
var AUTOPREFIXER = require("./autoprefixer.json");
var PERFECTIONIST = require("./perfectionist.json");

module.exports = {
	plugins: {
		"postcss-unprefix": {},
		"postcss-merge-longhand": {},
		autoprefixer: AUTOPREFIXER,
		perfectionist: PERFECTIONIST
	}
};
