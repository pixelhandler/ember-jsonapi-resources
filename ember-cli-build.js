/*jshint node:true*/
/* global require, module */
var EmberAddon = require('ember-cli/lib/broccoli/ember-addon');
var pickFiles = require('broccoli-static-compiler');
var compileES6 = require('broccoli-es6-concatenator');
var jsonToModule = require('./lib/json-to-module');

module.exports = function(defaults) {
  var app = new EmberAddon(defaults, {
    // Add options here
  });

  /*
    This build file specifies the options for the dummy test app of this
    addon, located in `/tests/dummy`
    This build file does *not* influence how the addon or the app using it
    behave. You most likely want to be modifying `./index.js` or app's build file
  */

  var buildTrees = [];

  if (app.tests) {

    app.import({
      development: app.bowerDirectory + '/es5-shim/es5-shim.js',
      production: app.bowerDirectory + '/es5-shim/es5-shim.min.js'
    });

    var sinon = pickFiles(app.bowerDirectory + '/sinon', {
      srcDir: '/',
      files: ['index.js'],
      destDir: '/assets/sinon'
    });

    buildTrees.push(sinon);

    var mocks = pickFiles('fixtures', {
      srcDir: '/',
      files: ['**/*.json'],
      destDir: '/fixtures'
    });

    var mocksJs = compileES6(jsonToModule(mocks), {
      inputFiles: [
        '**/*.js'
      ],
      wrapInEval: false,
      outputFile: '/assets/fixtures.js'
    });

    buildTrees.push(mocksJs);
  }

  return app.toTree(buildTrees);
};
