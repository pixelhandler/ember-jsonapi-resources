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

test('#cacheUpdate with existing cache', function(assert) {
  let ogTitle = testTitle();
  subject.cache.data.pushObjects([
    Post.create({ id: '1', attributes: { title: ogTitle } }),
    Post.create({ id: '2', attributes: { title: testTitle(2) } })
  ]);
  let cached = subject.cacheLookup('1');
  assert.equal(cached.get('title'), ogTitle, 'resource has og title ' + ogTitle);

  let newTitle = testTitle(1);
  subject.cacheUpdate({ meta:{}, headers:{},
    data: [ Post.create({id: '1', attributes: { title: newTitle } }) ]
  });
  cached = subject.cacheLookup('1');
  assert.equal(cached.get('title'), newTitle, 'cached updated title ' + newTitle);
});

test('without existing cache #cacheUpdate using data collection', function(assert) {
  subject.cacheUpdate({ meta:{}, headers:{},
    data: [ Post.create({id: '1', attributes: { title: testTitle() } }) ]
  });
  let cached = subject.cacheLookup('1');
  assert.equal(cached.get('title'), testTitle(), 'cached updated title ' + testTitle());
});

test('#cacheUpdate using data object', function(assert) {
  subject.cache.data.pushObject( Post.create({ id: '1', attributes: { title: testTitle() } }) );
  subject.cacheUpdate({
    data: Post.create({
      id: '1', attributes: { title: testTitle(1) }
    })
  });
  let cached = subject.cacheLookup('1');
  assert.equal(cached.get('title'), testTitle(1), 'cached has title update: ' + testTitle());
});

test('with existing cache #cacheData using data object', function(assert) {
  subject.cache.data.pushObject( Post.create({ id: '1', attributes: { title: testTitle() } }) );
  subject.cacheData({
    data: Post.create({
      id: '1', attributes: { title: testTitle(1) }
    })
  });
  let cached = subject.cacheLookup('1');
  assert.equal(cached.get('title'), testTitle(1), 'cached has title update: ' + testTitle(1));
});

test('without existing cache #cacheData using data object', function(assert) {
  subject.cacheData({
    data: Post.create({
      id: '1', attributes: { title: testTitle() }
    })
  });
  let cached = subject.cacheLookup('1');
  assert.equal(cached.get('title'), testTitle(), 'cached has title update: ' + testTitle());
});

test('with other existing cache #cacheData using data object', function(assert) {
  subject.cache.data.pushObject( Post.create({ id: '1', attributes: { title: testTitle() } }) );
  subject.cacheData({
    data: Post.create({
      id: '2', attributes: { title: testTitle(1) }
    })
  });
  let cached = subject.cacheLookup('2');
  assert.equal(cached.get('title'), testTitle(1), 'cached has title update: ' + testTitle(1));
});

test('#cacheData can update cache using #cacheUpdate', function(assert) {
  subject.cache.data.pushObject(
    Post.create({ id: '1', attributes: { title: testTitle() } })
  );
  let cached = subject.cacheLookup('1');
  assert.equal(cached.get('title'), testTitle(), 'cached resource with title ' + testTitle());
  let resource = Post.create({ id: '1', attributes: { title: testTitle(1) } });
  subject.cacheData({ data: [ resource ] });
  cached = subject.cacheLookup('1');
  assert.equal(cached.get('title'), testTitle(1), 'cached resource with updated title ' + testTitle(1));
});

test('#cacheControl', function(assert) {
  let resource = Post.create({ id: '1', attributes: { title: testTitle() } });
  let headers = mockHeaders();
  subject.cacheControl(resource, headers);
  assert.equal(resource.get('meta.cacheControl'), headers.get('cache-control'), 'header cache-control added to resource meta');
  assert.equal(resource.get('meta.timeStamps.server'), headers.get('date'), 'header date added to resource meta');
  assert.equal(resource.get('meta.etag'), headers.get('etag'), 'header etag added to resource meta');
});

function testTitle(idx = 0) {
  return [
    'JSON API paints my bikeshed!',
    'My painted bikeshed rocks, painted by JSON API!',
    'Rails is Omakase'
  ][idx];
}

function mockHeaders() {
  return Ember.Object.create({
    'cache-control': 'max-age=0, private, must-revalidate',
    'date': (new Date()).toUTCString(),
    'etag': 'W"a0096266a4ca13bdf581f89f58f23dd8"'
  });
}
