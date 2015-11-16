/*jshint node:true*/

var inflector = require('inflection');
var stringUtil  = require('ember-cli-string-utils');
var getDependencyDepth = require('ember-cli-get-dependency-depth');
var testInfo = require('ember-cli-test-info');

module.exports = {
  description: 'Generates an (ember-jsonapi-resource) initializer unit test.',

  locals: function(options) {
    var resource = options.entity.name || options.args[1];

    return {
      friendlyTestName: testInfo.name(resource, "Unit", "Initializer"),
      dependencyDepth: getDependencyDepth(resource),
      entity: stringUtil.dasherize(inflector.singularize(resource)),
      resource: stringUtil.dasherize(inflector.pluralize(resource))
    };
  },

  fileMapTokens: function() {
    return {
      __name__: function (options) {
        var moduleName = options.dasherizedModuleName.replace('jsonapi-', '');
        return moduleName;
      },
      __path__: function(options) {
        var blueprintName = options.originBlueprintName.replace('jsonapi-', '');
        return inflector.pluralize(blueprintName);
      }
    };
  }
};
