import Ember from 'ember';
import ServiceCacheMixin from '../../../mixins/service-cache';
import { module, test } from 'qunit';

module('Unit | Mixin | service cache');

// Replace this with your real tests.
test('it works', function(assert) {
  var ServiceCacheObject = Ember.Object.extend(ServiceCacheMixin);
  var subject = ServiceCacheObject.create();
  assert.ok(subject);
});
