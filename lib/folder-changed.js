'use strict';
var fs = require('fs'),
  path = require('path'),
  util = require('./util');
/**
 * quick and dirty change checking
 * checks if anything in the file's parent folder has changed
 * @param  {compiledFile}  path to compiled file. you can add :name (for file name) or :dirname (for parent folder name), and add :ext to use file ext
 * e.g. "public/css/:dirname:ext" to compare all files in, say, the "styles" dir with a compiled "styles.css"
 * @param {{parentName: Function, parentDir: Function}} [options] pass in custom functions you want to use to get name and dir, rather than using parent folder
 * @return {Function}
 */
function hasChanged(compiledFile, options) {
  return function (file) {
    var ext = path.extname(file.path),
      name = path.basename(file.path, ext),
      parent = util.getParentDir(file.path), // { name, dir }
      compiledCtime;

    // use custom functions to get name and dir
    if (options && options.parentName && typeof options.parentName === 'function') {
      parent.name = options.parentName(file.path);
    }
    if (options && options.parentDir && typeof options.parentDir === 'function') {
      parent.dir = options.parentDir(parent.name);
    }

    // figure out what compiled file to compare against
    compiledFile = compiledFile.replace(':name', name).replace(':dirname', parent.name).replace(':ext', ext);
    try {
      compiledCtime = fs.statSync(compiledFile).ctime;
    } catch(e) {
      compiledCtime = new Date(1); // if file doesn't exist, any source files should list as newer
    }

    if (util.haveOtherFilesBeenModified(parent.dir, ext, compiledCtime) || util.hasFolderBeenModified(parent.dir, compiledCtime)) {
      return true;
    } else {
      return false;
    }
  };
}

module.exports = hasChanged;