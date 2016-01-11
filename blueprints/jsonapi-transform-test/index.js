/*jshint node:true*/
var testInfo = require('ember-cli-test-info');
var inflector = require('inflection');
var stringUtil = require('ember-cli-string-utils');
var pathUtil = require('ember-cli-path-utils');

module.exports = {
  description: 'Generates a value transform unit test for use with ember-jsonapi-resources.',

  locals: function(options) {
    var transformName = options.entity.name || options.args[1];
    var dasherized = stringUtil.dasherize(transformName);
    var relativePath = pathUtil.getRelativeParentPath('../../');
    var dictionaryPath = relativePath + [ 'utils', 'dictionaries', dasherized ].join('/');
    var transformPath = relativePath + [ 'transforms', dasherized ].join('/');

    return {
      friendlyTestDescription: testInfo.description(options.entity.name, "Unit", "Transform"),
      dictionaryPath: dictionaryPath,
      transformPath: transformPath,
      transformName: stringUtil.camelize(transformName)
    };
  },

  fileMapTokens: function() {
    return {
      __name__: function (options) {
        return options.dasherizedModuleName.replace('jsonapi-', '');
      },
      __path__: function(options) {
        return inflector.pluralize(options.originBlueprintName.replace('jsonapi-', ''));
      }
    };
  }
};
