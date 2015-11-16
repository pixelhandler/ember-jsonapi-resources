/*jshint node:true*/

var inflector = require('inflection');
var stringUtil = require('ember-cli-string-utils');
var testInfo = require('ember-cli-test-info');
var ServiceBlueprint = require('../jsonapi-service');

module.exports = {
  description: 'Generates an (ember-jsonapi-resource) service unit test.',

  locals: function(options) {
    var resource = options.entity.name || options.args[1];

    return {
      friendlyTestDescription: testInfo.description(resource, "Unit", "Service"),
      resource: stringUtil.dasherize(inflector.pluralize(resource))
    };
  },

  fileMapTokens: function() {
    var tokens = ServiceBlueprint.fileMapTokens.apply(this, arguments);

    tokens['__test__'] = function (options) {
      if (options.pod) {
        return 'service-test';
      }
      var moduleName = options.dasherizedModuleName;
      return moduleName + '-test';
    };

    return tokens;
  }
};
