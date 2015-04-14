'use strict';
var fs = require('fs'),
  path = require('path'),
  util = require('./util');
/**
 * quick and dirty change checking
 * checks if anything in the file's parent folder has changed
 * @param  {compiledFile}  path to compiled file. you can add :name (for file name) or :dirname (for parent folder name), and add :ext to use file ext
 * e.g. "public/css/:dirname:ext" to compare all files in, say, the "styles" dir with a compiled "styles.css"
 * @return {Function}
 */
function hasChanged(compiledFile) {
  return function (file) {
    var ext = path.extname(file.path),
      name = path.basename(file.path, ext),
      parent = util.getParentDir(file.path), // { name, dir }
      compiledCtime;

    // figure out what compiled file to compare against
    compiledFile = compiledFile.replace(':name', name).replace(':dirname', parent.name).replace(':ext', ext);
    compiledCtime = fs.statSync(compiledFile).ctime;

    if (util.haveOtherFilesBeenModified(parent.dir, ext, compiledCtime) || util.hasFolderBeenModified(parent.dir, compiledCtime)) {
      return true;
    } else {
      return false;
    }
  };
}

module.exports = hasChanged;