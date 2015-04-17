'use strict';
var fs = require('fs'),
  path = require('path'),
  _ = require('lodash'),
  glob = require('glob'),
  util = require('./util');
/**
 * quick and dirty change checking
 * checks if anything in the file's parent folder has changed
 * @param  {compiledString}  path to compiled file(s). you can add :name (for file name) or :dirname (for parent folder name), and add :ext to use file ext
 * e.g. "public/css/:dirname:ext" to compare all files in, say, the "styles" dir with a compiled "styles.css"
 * @param {{parentName: Function, parentDir: Function}} [options] pass in custom functions you want to use to get name and dir, rather than using parent folder
 * @return {Function}
 */
function hasChanged(compiledString, options) {
  return function (file) {
    var ext = path.extname(file.path),
      name = path.basename(file.path, ext),
      parent = util.getParentDir(file.path), // { name, dir }
      changed = false,
      compiledGlob, compiledFiles, compiledCtime;

    // use custom functions to get name and dir
    if (options && options.parentName && typeof options.parentName === 'function') {
      parent.name = options.parentName(file.path);
    }
    if (options && options.parentDir && typeof options.parentDir === 'function') {
      parent.dir = options.parentDir(parent.name);
    }

    // figure out what compiled file to compare against
    compiledGlob = compiledString.replace(':name', name).replace(':dirname', parent.name).replace(':ext', ext);
    compiledFiles = glob.sync(compiledGlob);

    // if there are no current compiledFiles, the src files should recompile
    if (!compiledFiles.length) {
      changed = true;
    }

    // loop through all compiled files, checking to see if src files have changed
    _.map(compiledFiles, function (filePath) {
      // get the ctime of the compiled file
      compiledCtime = fs.statSync(filePath).ctime;

      // then compare them!
      if (util.haveOtherFilesBeenModified(parent.dir, ext, compiledCtime) || util.hasFolderBeenModified(parent.dir, compiledCtime)) {
        changed = true;
      }
    });

    return changed;
  };
}

module.exports = hasChanged;