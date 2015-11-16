import { moduleFor, test } from 'ember-qunit';
import Resource from '<%= modelPath %>';

moduleFor('serializer:<%= resource %>', '<%= friendlyTestDescription %>', {
  beforeEach() {
    Resource.prototype.container = this.container;
    let opts = { instantiate: false, singleton: false };
    this.registry.register('model:<%= resource %>', Resource, opts);
  },
  afterEach() {
    delete Resource.prototype.container;
  }
});

// Replace this with your real tests.
test('it serializes resources', function(assert) {
  let resource = this.container.lookupFactory('model:<%= resource %>').create();
  let serializer = this.subject();
  var serializedResource = serializer.serialize(resource);
  assert.equal(serializedResource.data.type, '<%= resource %>', 'serializes a <%= entity %> resource');
});
