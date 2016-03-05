/*jshint node:true*/
var inflector = require('inflection');
var stringUtil = require('ember-cli-string-utils');
var pathUtil = require('ember-cli-path-utils');
var path = require('path');

module.exports = {
  description: 'Generates an (ember-jsonapi-resource) service for resources following the JSON API 1.0 spec.',

  locals: function(options) {
    var resource = options.entity.name || options.args[1];
    var resourceSingular = inflector.singularize(resource);
    var relativePath = pathUtil.getRelativeParentPath(resource);

    var adapterPath = relativePath + [ 'adapters', resourceSingular ].join('/');
    if (options.pod) {
      relativePath = pathUtil.getRelativePath(resource);
      adapterPath = relativePath + 'adapter';
    }

    return {
      adapterPath: adapterPath,
      entity: stringUtil.dasherize(inflector.singularize(resource)),
      resource: stringUtil.dasherize(inflector.pluralize(resource))
    };
  },

  fileMapTokens: function() {
    return {
      __resource__: function(options) {
        if (options.pod) {
          return 'service';
        }
        return inflector.pluralize(options.locals.resource);
      },
      __path__: function(options) {
        if (options.pod && options.hasPathToken) {
          var moduleName = options.dasherizedModuleName.replace('jsonapi-', '');
          return path.join(options.podPath, moduleName);
        }
        var blueprintName = options.originBlueprintName.replace('jsonapi-', '');
        if (blueprintName === 'resource') {
          blueprintName = 'service';
        }
        return inflector.pluralize(blueprintName);
      },
      __root__: function(options) {
        if (options.inRepoAddon) {
          return path.join('lib', options.inRepoAddon, 'app');
        } else if (options.inAddon) {
          return 'app';
        }
        return 'app';
      }
    };
  }
};
