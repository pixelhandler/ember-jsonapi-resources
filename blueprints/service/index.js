var inflector = require('inflection');
var stringUtils = require('lodash/string');

module.exports = {
  description: 'Ember JSON API Resources: generates a service.',

  locals: function(options) {
    var resource = options.entity.name || options.args[1];
    return {
      entity: stringUtils.kebabCase(inflector.singularize(resource)),
      resource: stringUtils.kebabCase(inflector.pluralize(resource))
    };
  },

  fileMapTokens: function() {
    return {
      __resource__: function(options) {
        return inflector.pluralize(options.locals.resource);
      }
    };
  }
};
