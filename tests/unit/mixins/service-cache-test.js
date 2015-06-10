import Ember from 'ember';
import ServiceCacheMixin from '../../../mixins/service-cache';
import { module, test } from 'qunit';
import { Post } from 'dummy/tests/helpers/resources';

let sandbox, subject;

module('Unit | Mixin | service cache', {
  beforeEach() {
    sandbox = window.sinon.sandbox.create();
    let ServiceCacheObject = Ember.Object.extend(ServiceCacheMixin);
    subject = ServiceCacheObject.create();
  },
  afterEach() {
    sandbox.restore();
  }
});

test('#initCache', function(assert) {
  assert.ok(subject.cache, 'cache property setup');
  assert.equal(subject.cache.meta, null, 'cache meta property setup as null');
  assert.ok(Array.isArray(subject.cache.data.get('content')), 'cache data property setup as Array');
});

test('#cacheResource calls #cacheMeta and #cacheData', function(assert) {
  sandbox.stub(subject, 'cacheMeta', function () { return; });
  sandbox.stub(subject, 'cacheData', function () { return; });
  let resource = {};
  subject.cacheResource(resource);
  assert.ok(subject.cacheMeta.calledOnce, 'cacheMeta called');
  assert.ok(subject.cacheMeta.calledWith(resource), 'cacheMeta called with resource');
  assert.ok(subject.cacheData.calledWith(resource), 'cacheData called with resource');
  assert.ok(subject.cacheData.calledOnce, 'cacheData called');
});

test('#cacheMeta', function(assert) {
  let resource = { meta: { total: 5 } };
  subject.cacheMeta(resource);
  assert.equal(subject.get('cache.meta'), resource.meta, 'meta object set on cache.meta');
});

test('#cacheData stores a single resource', function(assert) {
  let resource = Post.create({ id: '1' });
  subject.cacheData({ data: resource });
  assert.equal(subject.get('cache.data').get('firstObject'), resource, 'resource added to cache.data collection');
});

test('#cacheData stores a collection of resources', function(assert) {
  let resourceA = Post.create({ id: '1' });
  let resourceB = Post.create({ id: '2' });
  subject.cacheData({ data: Ember.A([resourceA, resourceB]) });
  assert.equal(subject.get('cache.data').get('firstObject'), resourceA, 'resourceA added to cache.data collection');
  assert.equal(subject.get('cache.data').get('lastObject'), resourceB, 'resourceA added to cache.data collection');
});

test('#cacheLookup finds by id and returns if not expired', function(assert) {
  let resource = Post.create({
    id: '1',
    meta: { timeStamps: { local: Date.now() } },
    cacheDuration: /* minutes */ 1 * /* seconds */ 1 * /* milliseconds */ 1000
  });
  subject.cache.data.pushObject(resource);

  let cached = subject.cacheLookup('1');
  assert.equal(cached, resource, 'resource found in cache');
});

test('#cacheLookup does not return a resource if it is expired', function(assert) {
  let resource = Post.create({
    id: '1',
    meta: { timeStamps: { local: Date.now() - 1000 } },
    cacheDuration: /* minutes */ 1 * /* seconds */ 1 * /* milliseconds */ 1000
  });
  subject.cache.data.pushObject(resource);

  let cached = subject.cacheLookup('1');
  assert.notEqual(cached, resource, 'resource not found in cache');
});
