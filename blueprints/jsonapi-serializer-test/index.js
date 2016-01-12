/*jshint node:true*/

var inflector = require('inflection');
var stringUtil = require('ember-cli-string-utils');
var pathUtil = require('ember-cli-path-utils');
var testInfo = require('ember-cli-test-info');
var SerializerBlueprint = require('../jsonapi-serializer');
var getDependencyDepth = require('ember-cli-get-dependency-depth');

module.exports = {
  description: 'Generates an (ember-jsonapi-resource) serializer unit test.',

  locals: function(options) {
    var resource = options.entity.name || options.args[1];
    var resourceSingular = inflector.singularize(resource);
    var resourcePlural = inflector.pluralize(resource);

    var relativePath = getDependencyDepth(resource);
    var modelPath = [ relativePath, 'models', resourceSingular ].join('/');
    if (options.pod) {
      modelPath = [ relativePath, resourceSingular, 'model' ].join('/');
    }

    return {
      friendlyTestDescription: testInfo.description(resource, "Unit", "Serializer"),
      entity: stringUtil.dasherize(resourceSingular),
      resource: stringUtil.dasherize(resourcePlural),
      modelPath: modelPath
    };
  },

  fileMapTokens: function() {
    var tokens = SerializerBlueprint.fileMapTokens.apply(this, arguments);

    tokens['__test__'] = function (options) {
      if (options.pod) {
        return 'serializer-test';
      }
      var moduleName = options.dasherizedModuleName;
      return moduleName + '-test';
    };

    return tokens;
  }
};
