/*jshint node:true*/

var ModelBlueprint = require('../jsonapi-model');
var testInfo = require('ember-cli-test-info');
var inflector = require('inflection');
var stringUtil = require('ember-cli-string-utils');
var pathUtil = require('ember-cli-path-utils');
var getDependencyDepth = require('ember-cli-get-dependency-depth');

module.exports = {
  description: 'Generates a model unit test.',

  locals: function(options) {
    var resource = options.entity.name || options.args[1];
    var resourceSingular = inflector.singularize(resource);
    var resourcePlural = inflector.pluralize(resource);
    var result = ModelBlueprint.locals.apply(this, arguments);

    result.friendlyDescription = testInfo.description(resource, "Unit", "Model");
    result.entity = stringUtil.dasherize(resourceSingular);
    result.resource = stringUtil.dasherize(resourcePlural);

    var relativePath = getDependencyDepth(resource);
    var modelPath = [ relativePath, 'models', resourceSingular ].join('/');
    if (options.pod) {
      modelPath = [ relativePath, resourceSingular, 'model' ].join('/');
    }
    result.modelPath = modelPath;

    return result;
  },

  fileMapTokens: function() {
    var tokens = ModelBlueprint.fileMapTokens.apply(this, arguments);

    tokens['__test__'] = function (options) {
      if (options.pod) {
        return 'model-test';
      }
      var moduleName = options.dasherizedModuleName;
      return moduleName + '-test';
    };

    return tokens;
  }
};
