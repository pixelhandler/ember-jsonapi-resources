import Ember from 'ember';
import { initialize } from '<%= dependencyDepth %>/initializers/<%= dasherizedModuleName %>';
import { module, test } from 'qunit';

var registry, application;

module('<%= friendlyTestName %>', {
  beforeEach: function() {
    Ember.run(function() {
      application = Ember.Application.create();
      registry = application.registry;
      application.deferReadiness();
    });
  }
});

// Replace this with your real tests.
test('it works', function(assert) {
  initialize(registry, application);

  let model = registry.lookupFactory('model:<%= resource %>');
  assert.ok(model);

  let service = registry.lookupFactory('service:<%= resource %>');
  assert.ok(service);

  let adapter = registry.lookupFactory('adapter:<%= resource %>');
  assert.ok(adapter);

  let serializer = registry.lookupFactory('serializer:<%= resource %>');
  assert.ok(serializer);
});
