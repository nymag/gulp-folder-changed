'use strict';
var expect = require('chai').expect,
  sinon = require('sinon'),
  fs = require('fs'),
  vinyl = require('vinyl-fs-mock'),
  map = require('vinyl-map'),
  path = require('path'),
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

  it('parses `styles.css`', function (done) {
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
});