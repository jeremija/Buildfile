# buildfile

[![Build Status](https://travis-ci.com/jeremija/Buildfile.svg?branch=master)](https://travis-ci.com/jeremija/Buildfile) [![npm](https://img.shields.io/npm/v/buildfile.svg)](https://www.npmjs.com/package/buildfile)

This is a task runner utility similar to Makefile, but it does not check the
files of the timestamps. It uses the same concept of targets, dependencies,
and commands, but all targets are ".PHONY".

Additionally, a `-p` flag can be used to run them in parallel.

No dependencies. That's right, only Node.JS is required.

Install with: `npm install -g buildfile`

Run with: `build [target1 target2 ...]`

# why

Instead of having this in your `package.json`:

```json
  "scripts": {
    "test": "jest",
    "clean": "find src/ -type f -name '*.js' | xargs rm",
    "watch": "npm-run-all build:html build:css _watch",
    "_watch": "npm-run-all -p watch:*",
    "lint": "tslint --project .",
    "build": "npm-run-all build:* minify:*",
    "build:js": "browserify src/client/index.tsx -p [ tsify --project .] -g [ loose-envify purge --NODE_ENV production ] -v -o build/client.js",
    "minify:js": "terser --ecma 5 --compress -o build/client.min.js --mangle -- build/client.js",
    "watch:js": "watchify src/client/index.tsx -p [tsify --project .] -v -d -o build/client.js",
    "build:css": "node-sass -o build/ --output-style compressed src/scss/style.scss",
    "watch:css": "node-sass -o build/ --source-map true --source-map-contents true -w src/scss/style.scss",
    "build:html": "mustache src/views/index.json src/views/index.mustache > build/index.html",
    "rollup:js": "rollup -c ./rollup.config.js",
    "rollup:js:watch": "rollup -c ./rollup.config.js -w"
  },
```

one can write a `Buildfile` with the following contents:

```Makefile
test:
  jest

clean:
  find src/ -type f -name '*.js' | xargs rm

watch: build_html build_css _watch

_watch: -p watch-js watch-css 

lint:
  tslint --project .

build: build_html build_js build_css minify_js

build_css:
  node-sass -o build/ --output-style compressed src/scss/style.scss

build_js:
  browserify src/client/index.tsx -p [ tsify --project .] -g [ loose-envify purge --NODE_ENV production ] -v -o build/client.js<Paste>

watch_js:
  watchify src/client/index.tsx -p [tsify --project .] -v -d -o build/client.js

minify_js:
  terser --ecma 5 --compress -o build/client.min.js --mangle -- build/client.js

watch_css:
  node-sass -o build/ --source-map true --source-map-contents true -w src/scss/style.scss

build_html:
  mustache src/views/index.json src/views/index.mustache > build/index.html

rollup_js:
  rollup -c ./rollup.config.js

rollup_js_watch: 
	rollup -c ./rollup.config.js -w
```

# Basic syntax

If the following is put into a `Buildfile`:

```Makefile
target: dependency
  echo target

dependency:
  echo dependency
```

running `build` should run the first available target: `target`:

```
==> echo dependency
dependency
==> echo target
target
```

A custom target can be run by specifying it as `build dependency`.

# TODO

 - [x] Implement basic syntax parsing
 - [x] Add ability to execute syntax in parallel
 - [x] Add support for dependent targets
 - [x] Add ability to load custom files
 - [ ] Add wildcard support
 - [x] Add support command line continuation via `\`
 - [ ] Add support for different types of child_process stdio attachments

Have an idea? Let me know!

# License

MIT
