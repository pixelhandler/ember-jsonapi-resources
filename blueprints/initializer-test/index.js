/*jshint node:true*/

var inflector = require('inflection');
var stringUtils = require('lodash/string');
var getDependencyDepth = require('ember-cli/lib/utilities/get-dependency-depth');
var testInfo = require('ember-cli/lib/utilities/test-info');

module.exports = {
  description: 'Generates an initializer unit test.',
  locals: function(options) {
    var resource = options.entity.name || options.args[1];
    return {
      friendlyTestName: testInfo.name(options.entity.name, "Unit", "Initializer"),
      dependencyDepth: getDependencyDepth(options),
      entity: stringUtils.kebabCase(inflector.singularize(resource)),
      resource: stringUtils.kebabCase(inflector.pluralize(resource))
    };
  }
};
