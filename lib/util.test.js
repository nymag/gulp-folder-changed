'use strict';
var expect = require('chai').expect,
  mockFS = require('mock-fs'),
  sinon = require('sinon'),
  glob = require('glob'),
  util = require('./util');

describe('haveOtherFilesBeenModified()', function () {
  var sandbox;

  beforeEach(function () {
    sandbox = sinon.sandbox.create();
    // clear the memoize cache
    delete util.haveOtherFilesBeenModified.cache.__data__.dir;
  });

  afterEach(function () {
    sandbox.restore();
    mockFS.restore();
  });

  it('is false if file is same age as compiled file', function () {
    // create filesystem
    mockFS({
      dir: {
        'nochange.css': mockFS.file({
          content: 'one',
          ctime: new Date(1)
        })
      }
    });

    sandbox.stub(glob, 'sync').returns(['dir/nochange.css']);

    expect(util.haveOtherFilesBeenModified('dir', '.css', new Date(1))).to.equal(false);
  });

  it('is false if file has been deleted', function () {
    // create filesystem
    mockFS({
      dir: {} // empty folder
    });

    sandbox.stub(glob, 'sync').returns([]);

    expect(util.haveOtherFilesBeenModified('dir', '.css', new Date(1))).to.equal(false);
  });

  it('is false if file is older than compiled file', function () {
    // create filesystem
    mockFS({
      dir: {
        'older.css': mockFS.file({
          content: 'one',
          ctime: new Date(1)
        })
      }
    });

    sandbox.stub(glob, 'sync').returns(['dir/older.css']);

    expect(util.haveOtherFilesBeenModified('dir', '.css', new Date(2))).to.equal(false);
  });

  it('is true if file is newer than compiled file (e.g. file was created or changed)', function () {
    // create filesystem
    mockFS({
      dir: {
        'newer.css': mockFS.file({
          content: 'one',
          ctime: new Date(2),
          mtime: new Date(2)
        })
      }
    });

    sandbox.stub(glob, 'sync').returns(['dir/newer.css']);

    expect(util.haveOtherFilesBeenModified('dir', '.css', new Date(1))).to.equal(true);
  });
});

describe('hasFolderBeenModified()', function () {
  beforeEach(function () {
    // clear the memoize cache
    delete util.hasFolderBeenModified.cache.__data__.dir;
  });

  afterEach(function () {
    mockFS.restore();
  });

  it('is false if folder is same age as compiled file', function () {
    // create filesystem
    mockFS({
      dir: mockFS.directory({
        ctime: new Date(1)
      })
    });

    expect(util.hasFolderBeenModified('dir', new Date(1))).to.equal(false);
  });

  it('is false if folder is older than compiled file', function () {
    // create filesystem
    mockFS({
      dir: mockFS.directory({
        ctime: new Date(1)
      })
    });

    expect(util.hasFolderBeenModified('dir', new Date(2))).to.equal(false);
  });

  it('is true if folder is newer than compiled file (files added or removed from folder)', function () {
    // create filesystem
    mockFS({
      dir: mockFS.directory({
        ctime: new Date(2)
      })
    });

    expect(util.hasFolderBeenModified('dir', new Date(1))).to.equal(true);
  });
});

describe('getParentDir()', function () {
  afterEach(function () {
    mockFS.restore();
  });

  it('gets parent folder', function () {
    mockFS({
      foo: {
        bar: 'text'
      }
    });

    expect(util.getParentDir('foo/bar')).to.eql({ name: 'foo', dir: 'foo' });
  });

  it('gets heavily nested parent folder', function () {
    mockFS({
      foo: {
        bar: {
          baz: {
            qux: 'text'
          }
        }
      }
    });

    expect(util.getParentDir('foo/bar/baz/qux')).to.eql({ name: 'baz', dir: 'foo/bar/baz' });
  });
});