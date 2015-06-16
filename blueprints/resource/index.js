/*jshint node:true*/

var Blueprint   = require('ember-cli/lib/models/blueprint');
var Promise     = require('ember-cli/lib/ext/promise');
var merge       = require('lodash/object/merge');
var inflection  = require('inflection');
var stringUtils = require('lodash/string');
var path        = require('path');

module.exports = {
  description: 'Ember JSON API Resources: generates a model, service, adapter, serializer, and initializer.',

  install: function(options) {
    return this._process('install', options);
  },

  uninstall: function(options) {
    return this._process('uninstall', options);
  },

  locals: function(options) {
    var resource = options.entity.name || options.args[1];
    return {
      entity: stringUtils.kebabCase(inflection.singularize(resource)),
      resource: stringUtils.kebabCase(inflection.pluralize(resource))
    };
  },

  fileMapTokens: function() {
    return {
      __resource__: function(options) {
        return inflection.pluralize(options.locals.resource);
      }
    };
  },

  _processBlueprint: function(type, name, options) {
    var mainBlueprint = Blueprint.lookup(name, {
      ui: this.ui,
      analytics: this.analytics,
      project: this.project,
      paths: options.paths || [ path.resolve(__dirname, '..', '..', 'blueprints') ]
    });

    return Promise.resolve()
      .then(function() {
        return mainBlueprint[type](options);
      })
      .then(function() {
        var testBlueprint = mainBlueprint.lookupBlueprint(name + '-test', {
          ui: this.ui,
          analytics: this.analytics,
          project: this.project,
          ignoreMissing: true
        });

        if (!testBlueprint) { return; }

        if (testBlueprint.locals === Blueprint.prototype.locals) {
          testBlueprint.locals = function(options) {
            return mainBlueprint.locals(options);
          };
        }

        return testBlueprint[type](options);
      });
  },

  _process: function(type, options) {
    var modelOptions = merge({}, options, {
      entity: {
        name: inflection.singularize(options.entity.name)
      }
    });

    var otherOptions = merge({}, options);

    var self = this;
    return this._processBlueprint(type, 'model', modelOptions)
    .then(function() {
      return self._processBlueprint(type, 'adapter', otherOptions)
      .then(function() {
        return self._processBlueprint(type, 'serializer', otherOptions)
        .then(function() {
          return self._processBlueprint(type, 'service', otherOptions)
          .then(function() {
            return self._processBlueprint(type, 'initializer', otherOptions);
          });
        });
      });
    });
  }
};
