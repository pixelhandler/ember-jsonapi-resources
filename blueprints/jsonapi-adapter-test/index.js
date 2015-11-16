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
    var tokens = AdapterBlueprint.fileMapTokens.apply(this, arguments);

    tokens['__test__'] = function (options) {
      if (options.pod) {
        return 'adapter-test';
      }
      var moduleName = options.dasherizedModuleName;
      return moduleName + '-test';
    };

    return tokens;
  }
};
