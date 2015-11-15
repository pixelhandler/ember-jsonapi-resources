/*jshint node:true*/
var inflector = require('inflection');
var testInfo = require('ember-cli-test-info');
var AdapterBlueprint = require('../jsonapi-adapter');

module.exports = {
  description: 'Generates an (ember-jsonapi-resource) adapter unit test',

  locals: function(options) {
    return {
      friendlyTestDescription: testInfo.description(options.entity.name, "Unit", "Adapter")
    };
  },

  fileMapTokens: function() {
    return AdapterBlueprint.fileMapTokens.apply(this, arguments);
  }
};
