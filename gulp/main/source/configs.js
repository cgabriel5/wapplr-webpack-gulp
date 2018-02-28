// Get all needed configuration values.

// Bundles.
var BUNDLE_GULP = get($configs, "bundles.gulp", "");

// App configuration information.

// App directory information.
var INDEX = get($configs, "app.index", "");
var APPDIR = path.join(get($configs, "app.base", ""), $paths.rootdir);

// App settings editor.
var EDITOR = get($configs, "app.editor", {});
var EDITOR_ACTIVE = get(EDITOR, "active", false);
var EDITOR_CMD = get(EDITOR, "command", "");
var EDITOR_FLAGS = get(EDITOR, "flags", []);

// App line ending information.
var EOL = get($configs, "app.eol", "");
var EOL_ENDING = get(EOL, "ending", "");
// var EOL_STYLE = get(EOL, "style", "");

// Use https or not.
var HTTPS = get($configs, "app.https", false);

// App JSON indentation.
var JINDENT = get($configs, "app.indent_char", "\t");

// Plugin configurations.
var PRETTIER = get($configs, "prettier", {});
var JSBEAUTIFY = get($configs, "jsbeautify", {});
var AUTOPREFIXER = get($configs, "autoprefixer", {});
var PERFECTIONIST = get($configs, "perfectionist", {});
var BROWSERSYNC = get($configs, "browsersync", {});

// Internal information.
var INT_APPTYPE = get($internal.data, "apptype", "");
var INT_PROCESS = get($internal.data, "process", "");
var INT_PID = get(INT_PROCESS, "pid", "");
var INT_TITLE = get(INT_PROCESS, "title", "");
var INT_PORTS = get(INT_PROCESS, "ports", "");

// Get the current Gulp file name.
var GULPFILE = path.basename($paths.filename);
var GULPCLI = `gulp --gulpfile ${GULPFILE}`;
