/*jshint node:true*/

var inflector = require('inflection');
var stringUtils = require('lodash/string');
var testInfo = require('ember-cli/lib/utilities/test-info');

module.exports = {
  description: 'Ember JSON API Resources: generates a service unit test.',
  locals: function(options) {
    var resource = options.entity.name || options.args[1];
    return {
      friendlyTestDescription: testInfo.description(options.entity.name, "Unit", "Service"),
      entity: stringUtils.kebabCase(inflector.singularize(resource)),
      resource: stringUtils.kebabCase(inflector.pluralize(resource))
    };
  },
};
