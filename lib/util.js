'use strict';
var _ = require('lodash'),
  glob = require('glob'),
  fs = require('fs'),
  path = require('path'),
  haveOtherFilesBeenModified, hasFolderBeenModified;

/**
 * compare the ctimes of all files in a folder (matching extension) to a different ctime
 * @param  {string} dir   e.g. /my-component/
 * @param  {string} ext   e.g. .css
 * @param  {Date} ctime e.g. for the compiled css file
 * @return {Boolean}
 */
haveOtherFilesBeenModified = _.memoize(function (dir, ext, ctime) {
  var files = glob.sync(dir + '/**/*' + ext),
    hasChanged = false;

  _.map(files, function (file) {
    if (fs.statSync(file).ctime.getTime() > ctime.getTime()) {
      hasChanged = true;
    }
  });

  return hasChanged;
});

/**
 * compare the ctime of a folder to a different ctime
 * used to catch folders when you delete files inside them
 * @param  {string}  dir
 * @param  {Date}  ctime
 * @return {Boolean}
 */
hasFolderBeenModified = _.memoize(function (dir, ctime) {
  var folderCtime = fs.statSync(dir).ctime;

  return folderCtime.getTime() > ctime.getTime();
});

function getParentDir(filePath) {
  var arr = filePath.split(path.sep),
    name = arr[arr.length - 2],
    dir = _.dropRight(arr).join(path.sep);

  return {
    name: name,
    dir: dir
  };
}

exports.haveOtherFilesBeenModified = haveOtherFilesBeenModified;
exports.hasFolderBeenModified = hasFolderBeenModified;
exports.getParentDir = getParentDir;