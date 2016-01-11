/*jshint node:true*/

var stringUtil = require('ember-cli-string-utils');
var path       = require('path');
var inflector  = require('inflection');

module.exports = {
  description: 'Generates an import wrapper, (edited to strip out "jsonapi-" prefix for use with ember-jsonapi-resources)',

  fileMapTokens: function() {
    return {
      __name__: function(options) {
        var blueprintName = options.originBlueprintName.replace('jsonapi-', '');
        if (options.pod && options.hasPathToken) {
          return blueprintName;
        }
        var moduleName = options.dasherizedModuleName.replace('jsonapi-', '');
        return moduleName;
      },
      __path__: function(options) {
        var moduleName = options.dasherizedModuleName.replace('jsonapi-', '');
        if (options.pod && options.hasPathToken) {
          return path.join(options.podPath, moduleName);
        }
        var blueprintName = options.originBlueprintName.replace('jsonapi-', '');
        if (blueprintName.match(/dictionary/) !== null) {
          return 'utils/dictionaries';
        } else {
          return inflector.pluralize(blueprintName);
        }
      },
      __root__: function(options) {
        if (options.inRepoAddon) {
          return path.join('lib', options.inRepoAddon, 'app');
        }
        return 'app';
      }
    };
  },
  locals: function(options) {
    var addonRawName   = options.inRepoAddon ? options.inRepoAddon : options.project.name();
    var addonName      = stringUtil.dasherize(addonRawName);
    var blueprintName  = options.originBlueprintName.replace('jsonapi-', '');
    var fileName       = stringUtil.dasherize(options.entity.name);
    var modulePath     = [addonName, inflector.pluralize(blueprintName), fileName].join('/');

    if (options.pod) {
      modulePath = [addonName, fileName, blueprintName].join('/');
    }
    if (blueprintName.match(/dictionary/) !== null) {
      modulePath = [addonName, 'utils/dictionaries', fileName].join('/');
    }
    return {
      modulePath: modulePath
    };
  }
};
