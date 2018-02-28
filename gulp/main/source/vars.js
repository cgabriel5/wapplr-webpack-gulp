// Browsersync server variable. The variable is setup as an object
// with a stream method that returns an empty stream. This is done
// done to avoid any errors. For example, when tasks that use the bs
// stream method, like the html task, are called and the bs server
// does not exist an error will be thrown. Therefore, what is needed
// is to simply return an empty stream when the bs server has not
// been created. gulp-noop serves just that.
var __bs = {
	stream: $.noop
};

// Get current branch name.
var __branch_name;

// Remove options.
var opts_remove = {
	read: false,
	cwd: $paths.basedir
};

// The following variables are specific to the init:webpack task and
// webpack instance.
var __mode;
var __watching;
var __server;
