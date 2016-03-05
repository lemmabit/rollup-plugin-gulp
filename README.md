# rollup-plugin-gulp [![Dependency Status][david-image]][david-url]
This allows [gulp] plugins to be used as [Rollup] transforms. It supports
sourcemaps.

## Installation
```bash
npm install --save-dev Permutatrix/rollup-plugin-gulp
```
This will install the module from GitHub, since it hasn't been published to
NPM yet. I still need to write tests. I _hate_ writing tests.

## Usage
```js
// rollup.config.js
import gulpPlugin from 'rollup-plugin-gulp';
import typescript from 'gulp-typescript'; // just as an example

export default {
  entry: 'main.ts',

  plugins: [
    gulpPlugin(typescript({noImplicitAny: true}))
  ]
};
```

A chain of gulp plugins can be piped together and used with this syntax:
```js
// rollup.config.js
import gulpPlugin from 'rollup-plugin-gulp';
import preprocess from 'gulp-preprocess';
import typescript from 'gulp-typescript';

export default {
  entry: 'main.ts',

  plugins: [
    gulpPlugin(
      input => input
        .pipe(preprocess({context: {DEBUG: true}}))
        .pipe(typescript({noImplicitAny: true}))
    )
  ]
};
```


## API
### gulpPlugin(stream[, options])
Returns `stream` wrapped in a Rollup plugin.

#### options.include
A [minimatch] pattern or array of minimatch patterns describing which files
should be run through the plugin. Files not matching this pattern will not be
affected. If this option is omitted or of zero length, all files will be
included by default.

#### options.exclude
A minimatch pattern or array of minimatch patterns describing which files
should not be run through the plugin.

#### options.sourceMap
If this is false, sourcemaps will not be generated. Sourcemaps are generated
by default.

#### options.ignoreErroneousPaths
If this is true, extra files output by the gulp plugin will be ignored. By
default, an output file with a path not matching any input file will cause an
error to be raised.


## License
MIT


[david-url]:   https://david-dm.org/Permutatrix/rollup-plugin-gulp
[david-image]: https://img.shields.io/david/Permutatrix/rollup-plugin-gulp/master.svg

[gulp]:      http://gulpjs.com/
[Rollup]:    https://www.npmjs.com/package/rollup
[minimatch]: https://www.npmjs.com/package/minimatch
