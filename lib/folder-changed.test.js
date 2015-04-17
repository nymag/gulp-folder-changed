'use strict';
var sinon = require('sinon'),
  expect = require('chai').expect,
  fs = require('fs'),
  vinyl = require('vinyl-fs-mock'),
  map = require('vinyl-map'),
  path = require('path'),
  glob = require('glob'),
  util = require('./util'),
  changed = require('./folder-changed');

describe('folder-changed', function () {
  var mock, mockUtil, sandbox,
    files = vinyl({
      foo: {
        'bar.js': 'text'
      }
    });

  beforeEach(function () {
    mock = sinon.mock(fs);
    mockUtil = sinon.mock(util);
    sandbox = sinon.sandbox.create();

    // mock getParentDir
    mockUtil.expects('getParentDir').returns({ name: 'foo', dir: 'foo' });

    // stub out path
    sandbox.stub(path, 'extname').returns('.js');
    sandbox.stub(path, 'basename').returns('bar');
  });

  afterEach(function () {
    mock.restore();
    mockUtil.restore();
    sandbox.restore();
  });

  it('returns true if there are no compiled files', function (done) {
    sandbox.stub(glob, 'sync').returns([]);

    files.src('foo/bar.js')
      .pipe(map(function (file) {
        expect(changed('styles.css')(file)).to.equal(true);
        done();
      }));
  });

  it('parses `styles.css`', function (done) {
    sandbox.stub(glob, 'sync').returns(['styles.css']);
    mock.expects('statSync').withArgs('styles.css').returns({ ctime: new Date(1) });
    mockUtil.expects('haveOtherFilesBeenModified').withArgs('foo').returns(false);
    mockUtil.expects('hasFolderBeenModified').withArgs('foo').returns(false);

    files.src('foo/bar.js')
      .pipe(map(function (file) {
        changed('styles.css')(file);
        mock.verify();
        mockUtil.verify();
        done();
      }));
  });

  it('parses `:name.css`', function (done) {
    sandbox.stub(glob, 'sync').returns(['bar.css']);
    mock.expects('statSync').withArgs('bar.css').returns({ ctime: new Date(1) });
    mockUtil.expects('haveOtherFilesBeenModified').withArgs('foo').returns(false);
    mockUtil.expects('hasFolderBeenModified').withArgs('foo').returns(false);

    files.src('foo/bar.js')
      .pipe(map(function (file) {
        changed(':name.css')(file);
        mock.verify();
        mockUtil.verify();
        done();
      }));
  });

  it('parses `:dirname.css`', function (done) {
    sandbox.stub(glob, 'sync').returns(['foo.css']);
    mock.expects('statSync').withArgs('foo.css').returns({ ctime: new Date(1) });
    mockUtil.expects('haveOtherFilesBeenModified').withArgs('foo').returns(false);
    mockUtil.expects('hasFolderBeenModified').withArgs('foo').returns(false);

    files.src('foo/bar.js')
      .pipe(map(function (file) {
        changed(':dirname.css')(file);
        mock.verify();
        mockUtil.verify();
        done();
      }));
  });

  it('parses `:name:ext`', function (done) {
    sandbox.stub(glob, 'sync').returns(['bar.js']);
    mock.expects('statSync').withArgs('bar.js').returns({ ctime: new Date(1) });
    mockUtil.expects('haveOtherFilesBeenModified').withArgs('foo').returns(false);
    mockUtil.expects('hasFolderBeenModified').withArgs('foo').returns(false);

    files.src('foo/bar.js')
      .pipe(map(function (file) {
        changed(':name:ext')(file);
        mock.verify();
        mockUtil.verify();
        done();
      }));
  });

  it('parses `:dirname:ext`', function (done) {
    sandbox.stub(glob, 'sync').returns(['foo.js']);
    mock.expects('statSync').withArgs('foo.js').returns({ ctime: new Date(1) });
    mockUtil.expects('haveOtherFilesBeenModified').withArgs('foo').returns(false);
    mockUtil.expects('hasFolderBeenModified').withArgs('foo').returns(false);

    files.src('foo/bar.js')
      .pipe(map(function (file) {
        changed(':dirname:ext')(file);
        mock.verify();
        mockUtil.verify();
        done();
      }));
  });

  it('accepts a parentName function', function (done) {
    sandbox.stub(glob, 'sync').returns(['baz.js']);
    mock.expects('statSync').withArgs('baz.js').returns({ ctime: new Date(1) });
    mockUtil.expects('haveOtherFilesBeenModified').withArgs('foo').returns(false);
    mockUtil.expects('hasFolderBeenModified').withArgs('foo').returns(false);

    files.src('foo/bar.js')
      .pipe(map(function (file) {
        changed(':dirname:ext', { parentName: function () { return 'baz'; }})(file);
        mock.verify();
        mockUtil.verify();
        done();
      }));
  });

  it('accepts a parentDir function', function (done) {
    sandbox.stub(glob, 'sync').returns(['foo.js']);
    mock.expects('statSync').withArgs('foo.js').returns({ ctime: new Date(1) });
    mockUtil.expects('haveOtherFilesBeenModified').withArgs('baz/qux').returns(false);
    mockUtil.expects('hasFolderBeenModified').withArgs('baz/qux').returns(false);

    files.src('foo/bar.js')
      .pipe(map(function (file) {
        changed(':dirname:ext', { parentDir: function () { return 'baz/qux'; }})(file);
        mock.verify();
        mockUtil.verify();
        done();
      }));
  });

  it('matches on file globs', function (done) {
    sandbox.stub(glob, 'sync').returns(['foo.a.css', 'foo.b.css']);
    mock.expects('statSync').twice().returns({ ctime: new Date(1) });
    mockUtil.expects('haveOtherFilesBeenModified').twice().withArgs('foo').returns(false);
    mockUtil.expects('hasFolderBeenModified').twice().withArgs('foo').returns(false);

    files.src('foo/bar.js')
      .pipe(map(function (file) {
        changed(':dirname.*.css')(file);
        mock.verify();
        mockUtil.verify();
        done();
      }));
  });
});