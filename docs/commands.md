# Commands

Command documentation can be accessed by running `$ gulp help`. `help` command information is shown below.

```
Available Tasks

   help
     Provides this Gulp task documentation.
     
     -V, --verbose [boolean]
         Print complete documentation.
     
     -i, --internal [boolean]
         Print internal (yellow) tasks.
     
     -F, --filter [string]
         Names of tasks to show documentation for.
     
     $ gulp help
         Print tasks with descriptions only.
     
     $ gulp help --verbose
         Print full documentation (flags, usage, etc.).
     
     $ gulp help --filter "open default dependency"
         Print documentation for provided task names.
     
     $ gulp help --internal
         Include documentation for internally used tasks.

   eol        Change file line endings.
   files      Search and list project files.
   indent     Indent all JS files with tabs or spaces.
   lintcss    Lint a CSS file.
   linthtml   Lint a HTML file.
   lintjs     Lint a JS file.
   make       Build gulpfile from source files.
   open       Opens provided file in browser.
   ports      Print the currently used ports by browser-sync.
   pretty     Beautify (HTML, JS, CSS, & JSON) project files.
   settings   Build ./configs/.__settings.json
   stats      Print a table containing project file type breakdown.
   status     Print whether there is an active Gulp instance.
   tohtml     Converts Markdown (.md) file to .html.
```
