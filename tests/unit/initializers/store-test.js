import Ember from 'ember';
import { initialize } from '../../../initializers/store';
import { module, test } from 'qunit';

var container, application;

module('Unit | Initializer | store', {
  beforeEach: function() {
    Ember.run(function() {
      application = Ember.Application.create();
      container = application.__container__;
      application.deferReadiness();
    });
  }
});

test('it regisers the store service', function(assert) {
  initialize(container, application);
  let store = container.lookup('service:store');
  assert.ok(store, 'store service added to container');
});
