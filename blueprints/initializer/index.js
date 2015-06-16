var inflector = require('inflection');
var stringUtils = require('lodash/string');

module.exports = {
  description: 'Ember JSON API Resources: generates an initializer.',

  locals: function(options) {
    var resource = options.entity.name || options.args[1];
    return {
      entity: stringUtils.kebabCase(inflector.singularize(resource)),
      resource: stringUtils.kebabCase(inflector.pluralize(resource))
    };
  }
};
