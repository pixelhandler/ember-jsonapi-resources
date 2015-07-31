import { moduleFor, test } from 'ember-qunit';
import Resource from '../../../models/<%= dasherizedModuleName %>';

moduleFor('model:<%= entity %>', 'Unit | Model | <%= entity %>', {
  beforeEach() {
    const opts = { instantiate: false, singleton: false };
    Resource.prototype.container = this.container;
    // Use a non-standard name, i.e. pluralized instead of singular
    this.container.register('model:<%= resource %>', Resource, opts);
  },
  afterEach() {
    delete Resource.prototype.container;
  }
});

test('it exists', function(assert) {
  var model = this.container.lookupFactory('model:<%= resource %>').create();
  assert.equal(model.get('type'), '<%= resource %>', 'resource has expected type');
});
