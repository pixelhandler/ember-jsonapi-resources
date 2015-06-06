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

test('it works', function(assert) {
  initialize(container, application);

  assert.ok(true);
});
