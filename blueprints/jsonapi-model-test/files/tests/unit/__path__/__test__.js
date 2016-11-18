import { moduleFor, test } from 'ember-qunit';
import Model from '<%= modelPath %>';
import Ember from 'ember';

moduleFor('model:<%= dasherizedModuleName %>', '<%= friendlyDescription %>', {
  // Specify the other units that are required for this test.
<%= typeof needs !== 'undefined' ? needs : '' %>
  beforeEach() {
    let opts = { instantiate: false, singleton: false };
    this.registry.register('model:<%= entity %>', Model, opts);
  },
  afterEach() {
    this.registry.unregister('model:<%= entity %>');
  }
});

test('<%= resource %> has "type" property set to: <%= resource %>', function(assert) {
  let owner = Ember.getOwner(this);
  let model = owner.lookup('model:<%= entity %>').create();
  assert.equal(model.get('type'), '<%= resource %>', 'resource has expected type');
});
