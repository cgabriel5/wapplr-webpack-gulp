<!-- <div style="display: flex;flex-flow: row nowrap;justify-content: center;align-items:center;">
	<div style="display: flex;flex-flow: row nowrap;justify-content: space-between;align-items: center;width: 250px;">
		<div style="width: 80px;margin-top: 20px;"><img alt="wapplr-leaf-logo" src="http://localhost/projects/wapplr-webpack-gulp/docs/branding/wapplr/leaf-216.png?raw=true" style="display: block;"></div>
		<div style="width: 100px;margin-top: 20px;"><img alt="webpack-logo" src="http://localhost/projects/wapplr-webpack-gulp/docs/branding/webpack/webpack.png?raw=true" style="display: block;"></div>
		<div style="http://localhost/projects/wapplr-webpack-gulp/* width: 150px; */"><img alt="gulp-logo" src="http://localhost/projects/wapplr-webpack-gulp/docs/branding/gulp/gulp.png?raw=true" style="display: block;height: 110px;"></div>
	</div>
</div> -->
<p align="center"><img src="/docs/branding/wapplr/bundled.png?raw=true" alt="logo-text" width="25%"></p>
<p align="center"><img src="/docs/branding/wapplr/text.png?raw=true" alt="logo-text" width="25%"></p>
<p align="center"><code><b>w</b>eb-<b>app</b>-boi<b>l</b>e<b>r</b></code> is a web development boilerplate and tooling solution that uses webpack and Gulp.</p>
<h1></h1>

### Overview

This is a skeleton [`webpack`](https://webpack.js.org/) starter project that's wrapped with [`Gulp`](https://gulpjs.com/) to use the may of the tooling-tasks found in [`wapplr`](https://github.com/cgabriel5/wapplr).

### Quick Start
1. Clone repo &mdash; `$ git clone https://github.com/cgabriel5/wapplr-webpack-gulp.git "my-app"`
2. Install dependencies... &mdash; `$ yarn install`
	- Then start webpack via Gulp in one the following modes:
		- `development`: `$ gulp --mode=d`
		- `production`: `$ gulp --mode=p`
		- `server`: `$ gulp --mode=s`
3. Get acquainted with the provided Gulp [commands](/docs/commands.md).
4. Look over all other [documentation](/docs/).
5. Start developing!

### Features

- Boilerplate provides the project structure to get up and running.
	- Uses Gulp to run webpack.
	- webpack already configured to:
		- Compile ES6 code to ES5 using [Babel](https://babeljs.io/).
		- Optimize images.
		- Create project favicons.
		- Vue.js ready.
	- Modify project as needed.
- Fleshed out [`gulpfile.js`](/gulpfile.js) file.
	- Easily convert `.md` (`markdown`) files to their `.html` counterparts for previewing.
	- File reload via [`BrowserSync`](https://www.browsersync.io/).
		- Auto-detects free ports to use.
		- Auto-closes opened tabs when Gulp terminal process ends.
	- Search project files via the custom Gulp `files` task.
- Conveniently includes the following front-end libraries:
	- [`font-awesome`](http://fontawesome.io/)
	- [`sanitize.css`](https://jonathantneal.github.io/sanitize.css/) &mdash; Uses [`sanitize.css`](https://jonathantneal.github.io/sanitize.css/) by default.
	- [`normalize.css`](http://necolas.github.io/normalize.css/) &mdash; Easily switch to [`normalize.css`](http://necolas.github.io/normalize.css/) if desired.
	- [`modernizr.js`](https://modernizr.com/) &mdash; Support for building a custom build.
	- [`fastclick.js`](https://labs.ft.com/fastclick/)
	- [`jquery.js`](https://jquery.com/)
	- *Don't* need a pre-installed library? Simply remove what you don't need.
	- Need to add something else? Just add what you do need.

### Dependencies

- Project uses:
	- [`NodeJS`](https://nodejs.org/en/) &mdash; An open source, cross-platform JS runtime environment.
	- [`Gulp`](https://gulpjs.com/) &mdash; Automate painful, time-consuming development tasks.
	- [`webpack`](https://webpack.js.org/) &mdash; A module bundler.
	- [`Yarn`](https://yarnpkg.com/en/) &mdash; Fast, reliable, and secure dependency management.
	- [`Git`](https://git-scm.com/) &mdash; Distributed version control system.
	- [`Growl`](https://github.com/tj/node-growl/) &mdash; Unobtrusive notification system for NodeJS.
	- *Make sure they are installed.*

### Documentation

All project documentation can be found under the [`docs/`](/docs/) directory.

### Contributing

Contributions are welcome! Found a bug, feel like documentation is lacking/confusing and needs an update, have performance/feature suggestions or simply found a typo? Let me know! :)

See how to contribute [here](/CONTRIBUTING.md).

### License

This project uses the [MIT License](/LICENSE.txt).
