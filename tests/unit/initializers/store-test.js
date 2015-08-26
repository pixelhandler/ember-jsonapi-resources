import Ember from 'ember';
import { initialize } from '../../../initializers/store';
import { module, test } from 'qunit';

var registry, application, factories, injections;

module('Unit | Initializer | store', {
  beforeEach: function() {
    Ember.run(function() {
      application = Ember.Application.create();
      registry = application.registry;
      application.deferReadiness();
    });
    application = stub(application);
  },
  afterEach: function() {
    factories = null;
    injections = null;
    application = null;
    registry = null;
  }
});

test('it registers service and injects into route and controller', function(assert) {
  initialize(registry, application);

  let registered = Ember.A(factories.mapBy('name'));
  assert.ok(registered.contains('service:store'), 'service:briefs registered');

  let injection = injections.findBy('factory', 'route');
  assert.equal(injection.property, 'store', 'store injected into route factory');
  assert.equal(injection.injection, 'service:store', 'route.store is service:store');

  injection = injections.findBy('factory', 'controller');
  assert.equal(injection.property, 'store', 'store injected into controller factory');
  assert.equal(injection.injection, 'service:store', 'controller.store is service:store');
});

function stub(app) {
  factories = Ember.A([]);
  injections = Ember.A([]);
  app.register = function(name, factory) {
    factories.push({name: name, factory: factory});
  };
  app.inject = function(factory, property, injection) {
    injections.push({
      factory: factory,
      property: property,
      injection: injection
    });
  };
  return app;
}
