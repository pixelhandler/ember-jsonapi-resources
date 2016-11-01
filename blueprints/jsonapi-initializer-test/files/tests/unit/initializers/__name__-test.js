import Ember from 'ember';
import <%= classifiedModuleName %>Initializer from '<%= dependencyDepth %>/initializers/<%= dasherizedModuleName %>';
import { module, test } from 'qunit';

let registry, application, factories, injections;

module('<%= friendlyTestName %>', {
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

test('it registers <%= resource %> factory: model, injects into: service, serializer', function(assert) {
  <%= classifiedModuleName %>Initializer.initialize(registry, application);

  let registered = Ember.A(factories.mapBy('name'));
  assert.ok(registered.includes('model:<%= entity %>'), 'model:<%= entity %> registered');
  let msg = '<%= resource %> injected into service:store';
  assert.equal(injections.findBy('factory', 'service:store').property, '<%= resource %>', msg);
  msg = 'serializer injected into service:<%= resource %>';
  assert.equal(injections.findBy('factory', 'service:<%= resource %>').property, 'serializer', msg);
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
