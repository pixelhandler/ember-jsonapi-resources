/* jshint node: true */
/* global require, module */

var EmberAddon = require('ember-cli/lib/broccoli/ember-addon');
var pickFiles = require('broccoli-static-compiler');

/*
  This Brocfile specifes the options for the dummy test app of this
  addon, located in `/tests/dummy`

  This Brocfile does *not* influence how the addon or the app using it
  behave. You most likely want to be modifying `./index.js` or app's Brocfile
*/

var app = new EmberAddon();

var buildTrees = [];

if (process.env.EMBER_ENV === 'test') {

  var sinon = pickFiles(app.bowerDirectory + '/sinon', {
    srcDir: '/',
    files: ['index.js'],
    destDir: '/assets/sinon'
  });

  app.import({
    development: app.bowerDirectory + '/es5-shim/es5-shim.js',
    production: app.bowerDirectory + '/es5-shim/es5-shim.min.js'
  });

  buildTrees.push(sinon);
}

module.exports = app.toTree(buildTrees);
