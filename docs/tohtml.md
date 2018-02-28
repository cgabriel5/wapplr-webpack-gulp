# Markdown To HTML (tohtml)

`Markdown` files can be converted to their `HTML` counterparts by using the Gulp `tohtml` task. Converted files are stored in `markdown/previews/`. The folder is ignored via `.gitignore` and does not need to be manually created as its created when non existent (therefore it can be safely deleted). To learn more about the `tohtml` task run `$ gulp help --filter "tohtml"`.

### Example

In the following example [`./README.md`](/README.md) is converted to `README.html` and stored under `markdown/previews/README.html`.

```
$ gulp tohtml --file "README.md"
```

Once created the file can be manually opened in a browser or be opened by using the Gulp `open` task after or using the `open` flag.

```
$ gulp open --file "markdown/previews/tohtml.html"

# Or.

$ gulp open --file "markdown/previews/tohtml.html" --open # Convert and open file in a new tab.
```
