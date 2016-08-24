'use strict';
var path = require('path');
var resolve = require('resolve');
var Funnel = require('broccoli-funnel');
var MergeTrees = require('broccoli-merge-trees');

module.exports = {
  name: 'ember-cli-pretender',

  init: function() {
    this._super.init && this._super.init.apply(this, arguments);

    this._pretenderPath = resolve.sync('pretender');
    this._pretenderDir = path.dirname(this._pretenderPath);
    this._routeRecognizerPath = resolve.sync('route-recognizer', { basedir: this._pretenderDir });
    this._fakeRequestPath = resolve.sync('fake-xml-http-request', { basedir: this._pretenderDir });
  },

  treeForVendor: function(tree) {
    var pretenderTree = new Funnel(this._pretenderDir, {
      files: [path.basename(this._pretenderPath)],
      destDir: '/pretender',
    });

    var routeRecognizerFilename = path.basename(this._routeRecognizerPath);
    var routeRecognizerTree = new Funnel(path.dirname(this._routeRecognizerPath), {
      files: [routeRecognizerFilename, routeRecognizerFilename + '.map'],
      destDir: '/route-recognizer',
    });

    var fakeRequestTree = new Funnel(path.dirname(this._fakeRequestPath), {
      files: [path.basename(this._fakeRequestPath)],
      destDir: '/fake-xml-http-request',
    });

    var trees = [
      tree,
      pretenderTree,
      routeRecognizerTree,
      fakeRequestTree,
    ];

    return new MergeTrees(trees, {
      annotation: 'ember-cli-pretender: treeForVendor'
    });
  },

  included: function included(app) {
    if (app.app) {
      app = app.app;
    }
    this.app = app;

    var opts = app.options.pretender || { enabled: app.tests };
    if (opts.enabled) {
      app.import('vendor/fake-xml-http-request/' + path.basename(this._fakeRequestPath));
      app.import('vendor/route-recognizer/' + path.basename(this._routeRecognizerPath));
      app.import('vendor/pretender/' + path.basename(this._pretenderPath));
      app.import('vendor/ember-cli-pretender/shim.js', {
        type: 'vendor',
        exports: { 'pretender': ['default'] }
      });
    }
  },

  blueprintsPath: function() {
    return path.join(__dirname, 'blueprints');
  }

};
