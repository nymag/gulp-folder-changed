'use strict';
var sinon = require('sinon'),
  fs = require('fs'),
  vinyl = require('vinyl-fs-mock'),
  map = require('vinyl-map'),
  path = require('path'),
  util = require('./util'),
  changed = require('./folder-changed');

describe('folder-changed', function () {
  var mock, sandbox,
    files = vinyl({
      foo: {
        'bar.js': 'text'
      }
    });

  beforeEach(function () {
    mock = sinon.mock(fs);
    sandbox = sinon.sandbox.create();

    // stub out utils
    sandbox.stub(util, 'getParentDir').returns({ name: 'foo', dir: 'foo' });
    sandbox.stub(util, 'haveOtherFilesBeenModified').returns(false);
    sandbox.stub(util, 'hasFolderBeenModified').returns(false);

    // stub out path
    sandbox.stub(path, 'extname').returns('.js');
    sandbox.stub(path, 'basename').returns('bar');
  });

  afterEach(function () {
    mock.restore();
    sandbox.restore();
  });

  it('parses `styles.css`', function (done) {
    mock.expects('statSync').withArgs('styles.css').returns({ ctime: new Date(1) });

    files.src('foo/bar.js')
      .pipe(map(function (file) {
        changed('styles.css')(file);
        mock.verify();
        done();
      }));
  });

  it('parses `:name.css`', function (done) {
    mock.expects('statSync').withArgs('bar.css').returns({ ctime: new Date(1) });

    files.src('foo/bar.js')
      .pipe(map(function (file) {
        changed(':name.css')(file);
        mock.verify();
        done();
      }));
  });

  it('parses `:dirname.css`', function (done) {
    mock.expects('statSync').withArgs('foo.css').returns({ ctime: new Date(1) });

    files.src('foo/bar.js')
      .pipe(map(function (file) {
        changed(':dirname.css')(file);
        mock.verify();
        done();
      }));
  });

  it('parses `:name:ext`', function (done) {
    mock.expects('statSync').withArgs('bar.js').returns({ ctime: new Date(1) });

    files.src('foo/bar.js')
      .pipe(map(function (file) {
        changed(':name:ext')(file);
        mock.verify();
        done();
      }));
  });

  it('parses `:dirname:ext`', function (done) {
    mock.expects('statSync').withArgs('foo.js').returns({ ctime: new Date(1) });

    files.src('foo/bar.js')
      .pipe(map(function (file) {
        changed(':dirname:ext')(file);
        mock.verify();
        done();
      }));
  });
});