/*jshint node:true*/

var Blueprint = require('ember-cli/lib/models/blueprint');
var Promise = require('ember-cli/lib/ext/promise');
var merge = require('lodash/object/merge');
var inflection = require('inflection');
var path = require('path');

module.exports = {
  description: 'Generates (ember-jsonapi-resource) resources: a model, service, adapter, serializer, and initializer.',

  install: function(options) {
    return this._process('install', options);
  },

  uninstall: function(options) {
    return this._process('uninstall', options);
  },

  _processBlueprint: function(type, name, options) {
    var mainBlueprint = Blueprint.lookup(name, {
      ui: this.ui,
      analytics: this.analytics,
      project: this.project,
      // need to check blueprint paths from addons
      paths: options.paths || [ path.resolve(__dirname, '..', '..', 'blueprints') ]
    });

    return Promise.resolve()
      .then(function() {
        return mainBlueprint[type](options);
      })
      .then(function() {
        if (name === 'addon-import') { return; }
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
    var entityName = options.entity.name;

    var modelOptions = merge({}, options, {
      entity: {
        name: entityName ? inflection.singularize(entityName) : ''
      },
      originBlueprintName: 'jsonapi-model'
    });

    var otherOptions = merge({}, options);
    var promises = [
      this._processBlueprint(type, 'jsonapi-model', modelOptions),
      this._processBlueprint(type, 'jsonapi-adapter', otherOptions),
      this._processBlueprint(type, 'jsonapi-serializer', otherOptions),
      this._processBlueprint(type, 'jsonapi-service', otherOptions),
      this._processBlueprint(type, 'jsonapi-initializer', otherOptions)
    ];
    if (!!options.project.pkg['ember-addon']) {
      promies.push( this._processBlueprint(type, 'addon-import', modelOptions) );
    }
    return Promise.all(promises);
  }
};
