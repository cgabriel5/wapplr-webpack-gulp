# File Sub-extensions

Some files use specific project made file `sub-extensions` to denote something about the file. The following are the currently used sub-extensions:

- `.cm.` &mdash; Stands for _comment_.
	- Is typically used for `JSON` files that are allowed comments. When running Gulp tasks, for example, files with this sub-extension have comments removed before anything is done to them to allow for parsing.

- `.ig.` &mdash; Stands for _ignore_. 
	- Files with this sub-extension will be ignored in Gulp task operations. For example, when concatenating files to produce a single file sometimes some of the files will not contain properly valid code (think of modularization). This becomes an issue when prettifying files. Look at [`./js/source/app/iife/close.ig.js`](/js/source/app/iife/close.ig.js). If this file is prettified it will produce an error and cause the task to fail. Rightly so as the code is invalid (the file is purposefully incomplete). Using the ignore sub-extension will essentially skip the file from being prettified.
