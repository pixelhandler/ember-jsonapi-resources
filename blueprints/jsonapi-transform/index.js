/*jshint node:true*/
var inflector = require('inflection');
var stringUtil = require('ember-cli-string-utils');
var pathUtil = require('ember-cli-path-utils');
var path = require('path');

module.exports = {
  description: 'Generates an value transform for use with ember-jsonapi-resources.',

  locals: function(options) {
    var transformName = options.entity.name || options.args[1];
    var relativePath = pathUtil.getRelativeParentPath('.');
    var dictionaryPath = relativePath + [ 'utils', 'dictionaries', stringUtil.dasherize(transformName) ].join('/');

    return {
      dictionaryPath: dictionaryPath,
      className: 'Transform' + stringUtil.classify(transformName) + 'Attribute'
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
