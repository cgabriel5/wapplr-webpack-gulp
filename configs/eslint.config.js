// Get the configuration file.
var PRETTIER = require("./prettier.json");

// [https://medium.com/@netczuk/your-last-eslint-config-9e35bace2f99]
module.exports = {
	// [https://eslint.org/docs/user-guide/configuring#specifying-parser-options]
	parserOptions: {
		ecmaVersion: 6,
		sourceType: "module",
		ecmaFeatures: {
			jsx: false
		}
	},
	// [https://eslint.org/docs/user-guide/configuring#specifying-environments]
	env: {
		es6: true,
		browser: true,
		commonjs: true
	},
	// [https://eslint.org/docs/user-guide/configuring#specifying-globals]
	// [https://stackoverflow.com/a/34820916]
	globals: {
		module: true
	},
	// Extending recommended configuration and configuration derived from
	// eslint-config-prettier.
	// eslint:recommended: [https://eslint.org/docs/rules/]
	extends: ["eslint:recommended", "prettier"],
	plugins: ["prettier"], // Activating esling-plugin-prettier (--fix stuff).
	rules: {
		"prettier/prettier": [
			// Customizing prettier rules (unfortunately not many of them
			// are customizable).
			"error",
			PRETTIER
		],
		eqeqeq: ["error", "always"], // Adding some custom ESLint rules.
		parser: "babel-eslint"
	}
};
