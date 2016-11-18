import { moduleFor, test } from 'ember-qunit';
import Resource from '<%= modelPath %>';
import Ember from 'ember';

moduleFor('serializer:<%= entity %>', '<%= friendlyTestDescription %>', {
  beforeEach() {
    Ember.setOwner(Resource.prototype, Ember.getOwner(this));
    let opts = { instantiate: false, singleton: false };
    this.registry.register('model:<%= entity %>', Resource, opts);
  },
  afterEach() {
    delete Resource.prototype.container;
  }
});

// Replace this with your real tests.
test('it serializes resources', function(assert) {
  let owner = Ember.getOwner(this);
  let resource = owner.lookup('model:<%= entity %>').create();
  let serializer = this.subject();
  var serializedResource = serializer.serialize(resource);
  assert.equal(serializedResource.data.type, '<%= resource %>', 'serializes a <%= entity %> resource');
});
