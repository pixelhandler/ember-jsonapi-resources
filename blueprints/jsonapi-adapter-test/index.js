/*jshint node:true*/
var inflector   = require('inflection');
var testInfo = require('ember-cli-test-info');

module.exports = {
  description: 'Generates an (ember-jsonapi-resource) adapter unit test',

  locals: function(options) {
    return {
      friendlyTestDescription: testInfo.description(options.entity.name, "Unit", "Adapter")
    };
  },

  fileMapTokens: function() {
    return {
      __name__: function (options) {
        if (options.pod) {
          return 'adapter';
        }
        var moduleName = options.dasherizedModuleName.replace('jsonapi-', '');
        return moduleName;
      },
      __path__: function(options) {
        var blueprintName = options.originBlueprintName.replace('jsonapi-', '');
        var moduleName = options.dasherizedModuleName.replace('jsonapi-', '');
        if (options.pod && options.hasPathToken) {
          return path.join(options.podPath, moduleName);
        }
        return inflector.pluralize(blueprintName);
      }
    };
  }
};
