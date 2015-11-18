/*jshint node:true*/
var inflector = require('inflection');
var stringUtil = require('ember-cli-string-utils');
var pathUtil = require('ember-cli-path-utils');

module.exports = {
  description: 'Generates an (ember-jsonapi-resource) initializer for a service using the JSON API 1.0 spec.',

  locals: function(options) {
    var resource = options.entity.name || options.args[1];
    var resourceSingular = inflector.singularize(resource);
    var resourcePlural = inflector.pluralize(resource);
    var relativePath = pathUtil.getRelativeParentPath(resource);

    var servicePath = relativePath + [ 'services', resourcePlural ].join('/');
    var modelPath = relativePath + [ 'models', resourceSingular ].join('/');
    var adapterPath = relativePath + [ 'adapters', resourceSingular ].join('/');
    var serializerPath = relativePath + [ 'serializers', resourceSingular ].join('/');

    if (options.pod) {
      servicePath = relativePath + [ resourceSingular, 'service' ].join('/');
      modelPath = relativePath + [ resourceSingular, 'model' ].join('/');
      adapterPath = relativePath + [ resourceSingular, 'adapter' ].join('/');
      serializerPath = relativePath + [ resourceSingular, 'serializer' ].join('/');
    }

    return {
      entity: stringUtil.dasherize(resourceSingular),
      resource: stringUtil.dasherize(resourcePlural),
      servicePath: servicePath,
      modelPath: modelPath,
      adapterPath: adapterPath,
      serializerPath: serializerPath
    };
  },

  fileMapTokens: function() {
    return {
      __name__: function (options) {
        var moduleName = options.dasherizedModuleName.replace('jsonapi-', '');
        return moduleName;
      },
      __path__: function(options) {
        var moduleName = options.dasherizedModuleName.replace('jsonapi-', '');
        if (options.pod && options.hasPathToken) {
          return path.join(options.podPath, moduleName);
        }
        var blueprintName = options.originBlueprintName.replace('jsonapi-', '');
        return inflector.pluralize(blueprintName);
      }
    };
  }
};
