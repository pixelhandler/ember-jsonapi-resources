import { moduleFor, test } from 'ember-qunit';
import Model from '<%= modelPath %>';

moduleFor('model:<%= dasherizedModuleName %>', '<%= friendlyDescription %>', {
  // Specify the other units that are required for this test.
<%= typeof needs !== 'undefined' ? needs : '' %>
  beforeEach() {
    const opts = { instantiate: false, singleton: false };
    Model.prototype.container = this.container;
    // Use a non-standard name, i.e. pluralized instead of singular
    this.registry.register('model:<%= resource %>', Model, opts);
  },
  afterEach() {
    delete Model.prototype.container;
    this.registry.unregister('model:<%= resource %>');
  }
});

test('<%= resource %> has "type" property set to: <%= resource %>', function(assert) {
  var model = this.container.lookupFactory('model:<%= resource %>').create();
  assert.equal(model.get('type'), '<%= resource %>', 'resource has expected type');
});
