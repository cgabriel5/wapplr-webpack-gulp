// Node stock modules.
const path = require("path");

// Vue CLI templates: [https://github.com/vuejs-templates]
// [https://github.com/vuejs-templates/webpack-simple]
// [https://vuejs.org/2015/12/28/vue-cli/]

// Webpack + plugins.
const webpack = require("webpack");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const FaviconsWebpackPlugin = require("favicons-webpack-plugin");
const ExtractTextPlugin = require("extract-text-webpack-plugin");
const CleanWebpackPlugin = require("clean-webpack-plugin");
const Stylish = require("webpack-stylish");

// Check whether running in development or production.
const mode = process.env.NODE_ENV;
const is_wpd_server = mode === "server";
const is_prod = mode === "production";

// Get the project rootdir and remove the configs directory.
var rootdir = __dirname.replace(/\/configs$/, "/");

// Hold the used plugins in an array to be able to modify based on whether
// running in production or development.
let plugins = [
	new CleanWebpackPlugin(["dist"], {
		root: rootdir,
		verbose: false
	}),
	new Stylish()
];

// The project entries, or pages.
let entries = {
	index: ["./src/js/index.js"],
	about: ["./src/js/about.js"]
};

/**
 * Dynamically create the entries HTML pages'.
 *
 * @param  {array} plugins - The webpack plugins array.
 * @param  {object} entries - The entries to use.
 * @return {undefined} - Nothing.
 *
 * @resource [https://github.com/jantimon/html-webpack-plugin/issues/218#issuecomment-183066602]
 * @resource [https://github.com/jantimon/html-webpack-plugin/issues/299#issuecomment-216448896]
 */
(function(plugins, entries) {
	Object.keys(entries).map(entry_name => {
		plugins.push(
			new HtmlWebpackPlugin({
				filename: `${entry_name}.html`,
				chunks: [entry_name],
				hash: true,
				// inject: true,
				// title: `${entry_name} &mdash; webpack`,
				minify: {
					collapseWhitespace: is_prod
				},
				// Make sure the HTML template used the .ejs file extension so that
				// the template variables work.
				// [https://github.com/jantimon/html-webpack-plugin/issues/223#issuecomment-184330284]
				template: `./src/${entry_name}.html`
			}),
			new ExtractTextPlugin({
				filename: `css/[name].bundle.css`
				// allChunks: true
			})
		);
	});
})(plugins, entries);

// Our webpack configuration object.
module.exports = {
	entry: entries,
	output: {
		path: path.resolve(rootdir, "dist"),
		filename: "js/[name].bundle.js",
		// [https://github.com/gaearon/react-hot-loader/issues/456#issuecomment-316522465]
		// [http://code.fitness/post/2016/02/webpack-public-path-and-hot-reload.html]
		hotUpdateChunkFilename: ".hot/[id].[hash].hot-update.js",
		hotUpdateMainFilename: ".hot/[hash].hot-update.json"
		// publicPath: "/dist"
	},
	module: {
		rules: [
			{
				test: /\.html$/,
				use: {
					loader: "html-loader",
					options: { minimize: false }
				}
			},
			{
				enforce: "pre",
				test: /\.(jpg|png|gif|svg)$/,
				// [https://medium.com/a-beginners-guide-for-webpack-2/handling-images-e1a2a2c28f8d]
				// [https://github.com/webpack-contrib/url-loader/issues/6#issuecomment-63182275]
				// [https://github.com/webpack/webpack/issues/653#issuecomment-68519072]
				// [https://iamakulov.com/notes/optimize-images-webpack/]
				// [https://larsgraubner.com/webpack-images/]
				loader: "image-webpack-loader",
				options: {
					mozjpeg: {
						progressive: true,
						quality: 85
					},
					// Disable this optimizer by default to use pngquant.
					optipng: {
						enabled: false
					},
					pngquant: {
						quality: "85-90",
						speed: 4
					},
					gifsicle: {
						interlaced: false
					},
					svgo: {
						plugins: [
							{ removeViewBox: false },
							{ removeEmptyAttrs: false }
						]
					},
					webp: {
						quality: 85
					}
				}
			},
			{
				test: /\.(png|jpe?g|gif|ico|svg)$/,
				use: [
					{
						loader: "url-loader",
						options: {
							// Anything larger than the limit will get
							// defaulted to file-loader.
							limit: 10 * 1024,
							name: "[name]-[hash].[ext]",
							outputPath: function(filepath) {
								// The default output path.
								let output_path = "img/";

								// Modify font-awesome images to a sub-folder.
								if (/^fontawesome-webfont/.test(filepath)) {
									output_path += "font-awesome/";
								}

								// Make the new filepath and return it.
								return output_path + filepath;
							},
							publicPath: "img/"
						}
					}
				]
			},
			{
				test: /\.svg$/,
				loader: "svg-url-loader",
				options: {
					// Images larger than 10 KB won’t be inlined.
					limit: 10 * 1024,
					noquotes: true
				}
			},
			{
				// [https://medium.com/@chanonroy/webpack-2-and-font-awesome-icon-importing-59df3364f35c]
				test: /fontawesome-webfont\.(ttf|otf|eot|svg|woff2?)(\?v=[0-9]\.[0-9]\.[0-9])?$/,
				use: [
					{
						loader: "file-loader",
						options: {
							name: "[name].[ext]",
							outputPath: "fonts/fontawesome/", // Where the fonts will go.
							publicPath: "../fonts/fontawesome/" // Override the default path.
						}
					}
				]
			},
			{
				enforce: "pre",
				test: /\.js$/,
				loader: "eslint-loader",
				exclude: /node_modules/,
				options: {
					// Custom config file path.
					// [https://github.com/webpack-contrib/eslint-loader/issues/129#issuecomment-264917847]
					configFile: path.resolve(
						rootdir,
						"./configs/eslint.config.js"
					),
					cache: false
				}
			},
			{ test: /\.js$/, use: "babel-loader", exclude: /node_modules/ },
			{
				test: /modernizr\.config\.js$/,
				use: "webpack-modernizr-loader"
			},
			{
				test: /\.vue$/,
				loader: "vue-loader",
				options: {
					loaders: {}
				}
			},
			{
				test: /.scss$/,
				use: ExtractTextPlugin.extract({
					fallback: {
						// Note: Since vue-style-loader is a fork based on
						// style-loader it can be chained off after css-loader
						// to dynamically inject CSS into the document as style
						// tags. Therefore, it can then be used a the fallback
						// style-loader. It is also important to note that
						// since this is included as a dependency and used by
						// default in vue-loader, in most cases it's not needed
						// to configure this loader yourself.
						// [https://github.com/webpack-contrib/extract-text-webpack-plugin/issues/503#issuecomment-302228734]
						// [https://www.npmjs.com/package/vue-style-loader]
						loader: "vue-style-loader",
						// loader: "style-loader",
						options: { sourceMap: true }
					},
					use: [
						{
							loader: "css-loader",
							options: {
								// importLoaders: 1,
								sourceMap: true,
								minimize: is_prod
							}
						},
						{
							loader: "postcss-loader",
							options: {
								sourceMap: true,
								config: {
									// Custom config file path.
									// [https://github.com/postcss/postcss-loader#path]
									path: path.resolve(
										rootdir,
										"./configs/postcss.config.js"
									)
								}
							}
						},
						{
							loader: "sass-loader",
							options: { sourceMap: true }
						}
					],
					publicPath: "/dist"
				})
			}
		]
	},
	resolve: {
		alias: {
			modernizr$: path.resolve(rootdir, "./configs/modernizr.config.js")
		},
		alias: {
			vue$: "vue/dist/vue.esm.js"
		},
		extensions: ["*", ".js", ".vue", ".json"]
	},
	devServer: {
		// [https://webpack.js.org/configuration/dev-server/#devserver-port]
		// [https://matmunn.me/post/webpack-browsersync-php/]
		contentBase: "src/", // Relative directory for base of server.
		publicPath: "/", // Live-reload.
		inline: true,
		host: "localhost",
		historyApiFallback: true,
		noInfo: true,
		overlay: true
	},
	performance: {
		hints: false
	},
	// Add the following CLI options to generate sourcemaps:
	// [https://stackoverflow.com/a/46372748]
	devtool: is_prod ? "source-map" : "eval-source-map",
	// [https://webpack.js.org/configuration/stats/]
	// stats: "errors-only",
	stats: "none",
	plugins
};

// Taken and modified from vuejs webpack-simple scaffold. When running
// in production mode minimize code and generate project favicons.
if (is_prod) {
	// [http://vue-loader.vuejs.org/en/workflow/production.html]
	module.exports.plugins = plugins.concat([
		new webpack.DefinePlugin({
			"process.env": {
				NODE_ENV: '"production"'
			}
		}),
		new webpack.optimize.UglifyJsPlugin({
			sourceMap: true,
			compress: {
				warnings: false
			}
		}),
		new webpack.LoaderOptionsPlugin({
			minimize: true
		}),
		// Generate project favicons when running in production.
		// [https://github.com/haydenbleasel/favicons#usage]
		new FaviconsWebpackPlugin(require("./favicons.config.js"))
	]);
} else {
	module.exports.plugins = plugins.concat([
		// HMR should never be used in production:
		// [https://webpack.js.org/plugins/hot-module-replacement-plugin/]
		// [https://github.com/webpack/webpack/issues/1151#issuecomment-162792966]
		new webpack.HotModuleReplacementPlugin()
	]);
}
