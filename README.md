# buildfile

[![Build Status](https://travis-ci.com/jeremija/Buildfile.svg?branch=master)](https://travis-ci.com/jeremija/Buildfile) [![npm](https://img.shields.io/npm/v/buildfile.svg)](https://www.npmjs.com/package/buildfile)

This is a task runner utility similar to Makefile, but it does not check the
files of the timestamps. It uses the familiar concept of targets, dependencies,
and commands, but all targets are [phony][phony]. Supports wildcards using the
`*` character.

Additionally, a `-p` flag can be used to run them in parallel.

No dependencies. That's right, only Node.JS is required.

Install with: `npm install -g buildfile`

Run with: `build [target1 target2 ...]`

# Why

Instead of having this in `package.json`:

```json
  "scripts": {
    "test": "jest",
    "build": "npm-run-all *.build *.minify",
    "clean": "find src/ -type f -name '*.js' | xargs rm",
    "watch": "npm-run-all html.build css.build _watch",
    "_watch": "npm-run-all -p *.watch",
    "lint": "tslint --project .",

    "js.build": "browserify src/client/index.tsx -p [ tsify --project .] -g [ loose-envify purge --NODE_ENV production ] -v -o build/client.js",
    "js.watch": "watchify src/client/index.tsx -p [tsify --project .] -v -d -o build/client.js",
    "js.minify": "terser --ecma 5 --compress -o build/client.min.js --mangle -- build/client.js",

    "css.build": "node-sass -o build/ --output-style compressed src/scss/style.scss",
    "css.watch": "node-sass -o build/ --source-map true --source-map-contents true -w src/scss/style.scss",
    "html.build": "mustache src/views/index.json src/views/index.mustache > build/index.html",
  },
```

one can write a `Buildfile` with the following contents:

```Makefile
build: *.build *.minify

test:
  jest

clean:
  find src/ -type f -name '*.js' | xargs rm

watch: *.build --parallel *.watch

lint:
  tslint --project .

js.build:
  browserify src/client/index.tsx \
    -p [ tsify --project .] \
    -g [ loose-envify purge --NODE_ENV production ] \
    -v -o build/client.js
js.watch:
  watchify src/client/index.tsx -p [tsify --project .] -v -d -o build/client.js
js.minify:
  terser --ecma 5 --compress -o build/client.min.js --mangle -- build/client.js

css.build:
  node-sass -o build/ --output-style compressed src/scss/style.scss
css.watch:
  node-sass -o build/ --source-map true --source-map-contents true -w src/scss/style.scss

html.build:
  mustache src/views/index.json src/views/index.mustache > build/index.html
```

This is easier to read, line continuation is allowed, and tasks can be executed
in parallel via the `-p` or `--parallel` flag.

To run a target, simply type:

```bash
build       # runs the first target (build)
build test  # runs test target
build watch # runs the watch target
```

If you installed build locally, it can be invoked by running it via either:

```bash
npx build
# or
./node_modules/.bin/build
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
==> target
==> dependency
> echo dependency
 dependency
> echo target
target
```

A custom target can be run by specifying it as `build dependency`.

# Variables

Environment variables can be set:

```Makefile
echo:
  echo $args
```

```bash
$ build args=test
==> build
> echo test
test
```

The following also works:

```
var3 ?= value3
var4 := value4

test:
  echo $myvar1
  echo $myvar2
  echo $var1
  echo $(var4)
  echo $(var1:defaultValue)
  echo $(var1)
  echo $(var1:$(fallback))
  echo $(var1:$var2$var3)
```

# TODO

 - [x] Implement basic syntax parsing
 - [x] Add ability to execute syntax in parallel
 - [x] Add support for dependent targets
 - [x] Add ability to load custom files
 - [x] Add wildcard support
 - [x] Add support command line continuation via `\`
 - [x] Add support for different types of child_process stdio attachments
 - [x] Add support for comments beginning with `#`
 - [x] Add ability to replace environment variables
 - [x] Add ability to specify subprocess environment variables at the end
 - [x] Add ability to define env variables from within a `Buildfile`

Have an idea? Let me know!

# License

MIT

[phony]: https://www.gnu.org/software/make/manual/html_node/Phony-Targets.html
