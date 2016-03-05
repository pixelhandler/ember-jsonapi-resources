/*jshint node:true*/
var inflector = require('inflection');
var stringUtil = require('ember-cli-string-utils');
var SilentError = require('silent-error');
var pathUtil = require('ember-cli-path-utils');
var path = require('path');

module.exports = {
  description: 'Generates an (ember-jsonapi-resource) adapter following the JSON API 1.0 spec.',

  availableOptions: [
    { name: 'base-class', type: String }
  ],

  locals: function(options) {
    var resource = options.entity.name || options.args[1];
    var relativePath = pathUtil.getRelativePath(resource);
    options.baseClass = options.baseClass || 'application';

    var baseClass = stringUtil.classify(options.baseClass.replace('\/', '-')) + 'Adapter';
    var importStatement = 'import ' + baseClass + ' from \'' + relativePath + options.baseClass + '\';';
    if (resource === 'application') {
      importStatement = 'import ' + baseClass + ' from \'ember-jsonapi-resources/adapters/application\';';
    } else if (options.baseClass === resource) {
      throw new SilentError('Adapters cannot extend from themself. To resolve this, remove the `--base-class` option or change to a different base-class.');
    } else if (options.pod) {
      relativePath = pathUtil.getRelativeParentPath(resource);
      importStatement = 'import ' + baseClass + ' from \'' + relativePath + ['adapters', options.baseClass].join('/') + '\';';
    }

    // TOOD use isAddon to set path for importing confing from dasherizedPackageName or dummy app
    // var isAddon = options.inRepoAddon || options.project.isEmberCLIAddon();

    return {
      importStatement: importStatement,
      baseClass: baseClass,
      entity: stringUtil.dasherize(inflector.singularize(resource)),
      resource: stringUtil.dasherize(inflector.pluralize(resource))
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
        if (options.pod && options.hasPathToken) {
          var moduleName = options.dasherizedModuleName.replace('jsonapi-', '');
          return path.join(options.podPath, moduleName);
        }
        var blueprintName = options.originBlueprintName.replace('jsonapi-', '');
        if (blueprintName === 'resource') {
          blueprintName = 'adapter';
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
