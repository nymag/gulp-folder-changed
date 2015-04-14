# gulp-folder-changed
Gulp plugin to pass through files if they've changed

# Install

```
npm install --save-dev gulp-folder-changed
```

# Usage

Pass this into something like [gulp-ignore](https://github.com/robrich/gulp-ignore) to pass through all files in a folder if any of those files has changed.

To match against a single file, pass in the file path:

```
dest/
  styles.css
src/
  a.css
  b.css
```

```js
var ignore = require('gulp-ignore'),
  folderChanged = require('gulp-folder-changed');

gulp.src('src/*.css')
  .pipe(ignore.include(folderChanged('dest/styles.css')))
  .pipe(doSomethingWithTheChangedFiles);
```

You can also match against files with the same name as the source files:

```
dest/
  a.css
  b.css
src/
  a.css
  b.css
```

```js
gulp.src('src/*.css')
  .pipe(ignore.include(folderChanged('dest/:name.css')))
  .pipe(doSomethingWithTheChangedFiles);
```

If you sort your source files into specific folders, you can match on the parent folder instead:

```
dest/
  folder1.css
  folder2.css
src/
  folder1/
    a.css
    b.css
  folder2/
    a.css
    b.css
```

```js
gulp.src('src/**/*.css')
  .pipe(ignore.include(folderChanged('dest/:dirname.css')))
  .pipe(doSomethingWithTheChangedFiles);
```

You can also specify matching extensions (note: `:ext` includes the dot):

```
dest/
  foo.css
  foo.js
src/
  bar.css
  baz.js
```

```js
gulp.src('src/**/*.css')
  .pipe(ignore.include(folderChanged('dest/foo:ext')))
  .pipe(doSomethingWithTheChangedFiles);
```

Combine them to create powerful matching schemas!

```
dest/
  foo-a.css
  foo-b.css
  foo-c.js
  bar-a.css
  bar-b.js
src/
  foo/
    a.css
    b.css
    c.js
  bar/
    a.css
    b.js
```

```js
gulp.src('src/**/*.css')
  .pipe(ignore.include(folderChanged('dest/:dirname-:name:ext')))
  .pipe(doSomethingWithTheChangedFiles);
```

If you want to do something super custom, you can pass an object with either a `parentName` or `parentDir` (or both!) as a second argument:

```
dest/
  foo.css
  bar.css
src/
  foo/
    styles/
      a.css
      b.css
  bar/
    styles/
      a.css
      b.css
```

```js
var path = require('path'),
  _ = require('lodash');

// src/foo/styles/a.css -> foo
function getName(filePath) {
  return _.last(_.dropRight(path.dirname(filePath).split(path.sep)));
}

// src/foo/styles/a.css -> src/foo
function getFolder(filePath) {
  return _.dropRight(path.dirname(filePath).split(path.sep));
}

gulp.src('src/**/*.css')
  .pipe(ignore.include(folderChanged('dest/:dirname:ext', {
    parentName: getName,
    parentDir: getFolder
  })))
  .pipe(doSomethingWithTheChangedFiles);
```

Have fun!