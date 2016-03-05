/*jshint node:true*/

var inflector = require('inflection');
var stringUtil = require('ember-cli-string-utils');
var pathUtil = require('ember-cli-path-utils');
var path = require('path');

module.exports = {
  description: 'Generates an (ember-jsonapi-resource) serializer following the JSON API 1.0 spec.',

  locals: function(options) {
    var resource = options.entity.name || options.args[1];
    var relativePath = pathUtil.getRelativePath(resource);
    var importStatement = "import ApplicationSerializer from '" + relativePath + "application';";
    if (options.pod) {
      var relativePath = pathUtil.getRelativeParentPath(resource);
      importStatement = "import ApplicationSerializer from '" + relativePath + ['serializers', 'application'].join('/') + ";";
    }

    return {
      importStatement: importStatement
    };
  },

  fileMapTokens: function() {
    return {
      __name__: function (options) {
        if (options.pod) {
          return 'serializer';
        }
        var moduleName = options.dasherizedModuleName.replace('jsonapi-', '');
        return moduleName;
      },
      __path__: function(options) {
        if (options.pod && options.hasPathToken) {
          var moduleName = options.dasherizedModuleName.replace('jsonapi-', '');
          return path.join(options.podPath, moduleName);
        }
        var blueprintName = options.originBlueprintName.replace('jsonapi-', '');
        if (blueprintName === 'resource') {
          blueprintName = 'serializer';
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
