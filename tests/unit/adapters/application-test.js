import { moduleFor, test } from 'ember-qunit';
import Adapter from 'ember-jsonapi-resources/adapters/application';
import Ember from 'ember';
import { Post } from 'dummy/tests/helpers/resources';

import postMock from 'fixtures/api/posts/1';
import postsMock from 'fixtures/api/posts';

let sandbox, skip = QUnit.skip;

function RSVPonerror(error) {
  throw new Error(error);
}

moduleFor('adapter:application', 'Unit | Adapter | application', {
  beforeEach() {
    sandbox = window.sinon.sandbox.create();
    Ember.RSVP.configure('onerror', RSVPonerror);
  },
  afterEach() {
    sandbox.restore();
  }
});

test('#find calls #findOne when options arg is a string', function(assert) {
  const adapter = this.subject();
  sandbox.stub(adapter, 'findOne', function () { return Ember.RSVP.Promise.resolve(null); });
  let promise = adapter.find('1');
  assert.ok(typeof promise.then === 'function', 'returns a thenable');
  assert.ok(adapter.findOne.calledOnce, 'findOne called');
  assert.ok(adapter.findOne.calledWith('1'), 'findOne called with "1"');
});

test('#find calls #findOne when options arg is an object having an id property', function(assert) {
  const adapter = this.subject();
  sandbox.stub(adapter, 'findOne', function () { return Ember.RSVP.Promise.resolve(null); });
  let options = { id: '1', query: {sort: '-date'} };
  let promise = adapter.find(options);
  assert.ok(typeof promise.then === 'function', 'returns a thenable');
  assert.ok(adapter.findOne.calledOnce, 'findOne called');
  assert.ok(adapter.findOne.calledWith(options.id, options.query), 'findOne called with `"1"` and query `{"sort": "-date"}`');
});

test('#find calls #findQuery when options arg is undefined', function(assert) {
  const adapter = this.subject();
  sandbox.stub(adapter, 'findQuery', function () { return Ember.RSVP.Promise.resolve(null); });
  let promise = adapter.find(undefined);
  assert.ok(typeof promise.then === 'function', 'returns a thenable');
  assert.ok(adapter.findQuery.calledOnce, 'findQuery called');
});

test('#find calls #findQuery with options object (that has no id property)', function(assert) {
  const adapter = this.subject();
  sandbox.stub(adapter, 'findQuery', function () { return Ember.RSVP.Promise.resolve(null); });
  let options = { query: {sort: '-date'} };
  let promise = adapter.find(options);
  assert.ok(typeof promise.then === 'function', 'returns a thenable');
  assert.ok(adapter.findQuery.calledOnce, 'findQuery called');
  assert.ok(adapter.findQuery.calledWith(options), 'findQuery called with query `{"sort": "-date"}`');
});

test('#findOne calls #fetch with url and options object with method:GET', function(assert) {
  const adapter = this.subject({type: 'posts', url: '/posts'});
  sandbox.stub(adapter, 'fetch', function () { return Ember.RSVP.Promise.resolve(null); });
  let promise = adapter.findOne('1');
  assert.ok(typeof promise.then === 'function', 'returns a thenable');
  assert.ok(adapter.fetch.calledOnce, 'fetch called');
  assert.ok(adapter.fetch.calledWith('/posts/1', { method: 'GET' }), 'fetch called with url and method:GET');
});

test('#findQuery calls #fetch url and options object with method:GET', function(assert) {
  const adapter = this.subject({type: 'posts', url: '/posts'});
  sandbox.stub(adapter, 'fetch', function () { return Ember.RSVP.Promise.resolve(null); });
  let promise = adapter.findQuery();
  assert.ok(typeof promise.then === 'function', 'returns a thenable');
  assert.ok(adapter.fetch.calledOnce, 'fetch called');
  assert.ok(adapter.fetch.calledWith('/posts', { method: 'GET' }), 'fetch called with url and method:GET');
});

test('#findQuery calls #fetch url including a query', function(assert) {
  const adapter = this.subject({type: 'posts', url: '/posts'});
  sandbox.stub(adapter, 'fetch', function () { return Ember.RSVP.Promise.resolve(null); });
  let promise = adapter.findQuery({ query: { sort:'-desc' } });
  assert.ok(typeof promise.then === 'function', 'returns a thenable');
  assert.ok(adapter.fetch.calledOnce, 'fetch called');
  assert.ok(adapter.fetch.calledWith('/posts?sort=-desc', { method: 'GET' }), 'fetch called with url?query and method:GET');
});

test('#findRelated', function(assert) {
  this.container.register('service:authors', Adapter.extend({type: 'authors', url: '/authors'}));
  let resource = Post.create(postMock.data);
  let url = resource.get( ['relationships', 'author', 'links', 'related'].join('.') );
  const adapter = this.subject({type: 'posts', url: '/posts'});
  let service = this.container.lookup('service:authors');
  sandbox.stub(service, 'fetch', function () { return Ember.RSVP.Promise.resolve(null); });
  let promise = adapter.findRelated('author', url);
  assert.ok(typeof promise.then === 'function', 'returns a thenable');
  assert.ok(service.fetch.calledOnce, 'authors service#fetch method called');
  let expectURL = 'http://api.pixelhandler.com/api/v1/posts/1/author';
  assert.ok(service.fetch.calledWith(expectURL, { method: 'GET' }), 'url for relation passed to service#fetch');
});

test('#createResource', function(assert) {
  const adapter = this.subject({type: 'posts', url: '/posts'});
  adapter.serializer = { serialize: function () { return postMock; } };
  sandbox.stub(adapter, 'fetch', function () { return Ember.RSVP.Promise.resolve(null); });
  let promise = adapter.createResource({ type: 'b0gus, not testing serializer' });
  assert.ok(typeof promise.then === 'function', 'returns a thenable');
  assert.ok(adapter.fetch.calledOnce, '#fetch method called');
  let msg = '#fetch called with url and options with data';
  assert.ok(adapter.fetch.calledWith('/posts', { method: 'POST', body: JSON.stringify(postMock) }), msg);
});

test('#updateResource', function(assert) {
  const adapter = this.subject({type: 'posts', url: '/posts'});
  let payload = {
    data: {
      type: postMock.data.type,
      id: postMock.data.id,
      attributes: {
        title: postMock.data.attributes.title + ' changed'
      }
    }
  };
  adapter.serializer = { serializeChanged: function () { return payload; } };
  sandbox.stub(adapter, 'fetch', function () { return Ember.RSVP.Promise.resolve(null); });
  let resource = Post.create(postMock.data);
  let promise = adapter.updateResource(resource);
  assert.ok(typeof promise.then === 'function', 'returns a thenable');
  assert.ok(adapter.fetch.calledOnce, '#fetch method called');
  let selfURL = 'http://api.pixelhandler.com/api/v1/posts/1';
  let msg = '#fetch called with url and options with data';
  assert.ok(adapter.fetch.calledWith(selfURL, { method: 'PATCH', body: JSON.stringify(payload) }), msg);
});

test('#patchRelationship', function(assert) {
  const adapter = this.subject({type: 'posts', url: '/posts'});
  sandbox.stub(adapter, 'fetch', function () { return Ember.RSVP.Promise.resolve(null); });
  let resource = Post.create(postMock.data);
  resource.addRelationship('comments', '1');
  let promise = adapter.patchRelationship(resource, 'comments');
  assert.ok(typeof promise.then === 'function', 'returns a thenable');
  let relationURL = 'http://api.pixelhandler.com/api/v1/posts/1/relationships/comments';
  let jsonBody = '[{"type":"comments","id":"1"}]';
  let msg = '#fetch called with url and options with data';
  assert.ok(adapter.fetch.calledWith(relationURL, { method: 'PATCH', body: jsonBody }), msg);
});

test('#deleteResource can be called with a string as the id for the resource', function(assert) {
  const adapter = this.subject({type: 'posts', url: '/posts'});
  sandbox.stub(adapter, 'fetch', function () { return Ember.RSVP.Promise.resolve(null); });
  let resource = Post.create(postMock.data);
  let promise = adapter.deleteResource('1');
  assert.ok(typeof promise.then === 'function', 'returns a thenable');
  let msg = '#fetch called with url';
  assert.ok(adapter.fetch.calledWith('/posts/1', { method: 'DELETE' }), msg);
});

test('#deleteResource can be called with a resource having a self link, and calls resource#destroy', function(assert) {
  const adapter = this.subject({type: 'posts', url: '/posts'});
  sandbox.stub(adapter, 'fetch', function () { return Ember.RSVP.Promise.resolve(null); });
  let resource = Post.create(postMock.data);
  sandbox.stub(resource, 'destroy', function () {});
  let promise = adapter.deleteResource(resource);
  assert.ok(typeof promise.then === 'function', 'returns a thenable');
  assert.ok(resource.destroy.calledOnce, 'resource#destroy method called');
  let selfURL = 'http://api.pixelhandler.com/api/v1/posts/1';
  let msg = '#fetch called with url';
  assert.ok(adapter.fetch.calledWith(selfURL, { method: 'DELETE' }), msg);
});

test('#fetch calls #fetchURL to customize if needed', function(assert) {
  const adapter = this.subject({type: 'posts', url: '/posts'});
  sandbox.stub(adapter, 'fetchUrl', function () {});
  sandbox.stub(window, 'fetch', function () { return Ember.RSVP.Promise.resolve({ "status": 204 }); });
  let promise = adapter.fetch('/posts', { method: 'PATCH', body: 'json string here' });
  assert.ok(typeof promise.then === 'function', 'returns a thenable');
  assert.ok(adapter.fetchUrl.calledWith('/posts'), '#fetchUrl called with url');
});

test('#fetch calls #fetchOptions checking if the request is an update, if true skips call to deserialize/cacheResource', function(assert) {
  const adapter = this.subject({type: 'posts', url: '/posts'});
  sandbox.stub(adapter, 'fetchUrl', function () {});
  sandbox.stub(window, 'fetch', function () {
    return Ember.RSVP.Promise.resolve({
      "status": 202,
      "json": function() {
        return Ember.RSVP.Promise.resolve(null);
      }
    });
  });
  sandbox.stub(adapter, 'cacheResource', function () {});
  adapter.serializer = { deserialize: sandbox.spy() };
  let promise = adapter.fetch('/posts', { method: 'PATCH', body: 'json string here', update: true });
  assert.ok(typeof promise.then === 'function', 'returns a thenable');
  assert.equal(adapter.cacheResource.callCount, 0, '#cacheResource method NOT called');
  assert.equal(adapter.serializer.deserialize.callCount, 0, '#deserialize method NOT called');
});

test('#fetchUrl', function(assert) {
  const adapter = this.subject();
  let url = adapter.fetchUrl('/posts');
  assert.equal(url, '/posts', 'returns url');
});

test('#cacheResource called after successful fetch', function(assert) {
  assert.expect(2);
  const done = assert.async();
  const adapter = this.subject();
  sandbox.stub(adapter, 'cacheResource', function () {});
  adapter.serializer = {
    deserialize: function () { return postsMock.data; },
    deserializeIncluded: function () { return; }
  };
  sandbox.stub(window, 'fetch', function () {
    return Ember.RSVP.Promise.resolve({
      "status": 200,
      "json": function() {
        return Ember.RSVP.Promise.resolve(postsMock);
      }
    });
  });
  let promise = adapter.fetch('/posts/1', { method: 'GET' });
  assert.ok(typeof promise.then === 'function', 'returns a thenable');
  promise.then(function() {
    assert.ok(adapter.cacheResource.calledOnce, '#cacheResource method called');
    done();
  });
});

test('serializer#deserializeIncluded called after successful fetch', function(assert) {
  assert.expect(2);
  const done = assert.async();
  const adapter = this.subject();
  adapter.serializer = {
    deserialize: function () { return postMock.data; },
    deserializeIncluded: sandbox.spy()
  };
  sandbox.stub(window, 'fetch', function () {
    return Ember.RSVP.Promise.resolve({
      "status": 200,
      "json": function() {
        return Ember.RSVP.Promise.resolve(postMock);
      }
    });
  });
  let promise = adapter.fetch('/posts/1', { method: 'GET' });
  assert.ok(typeof promise.then === 'function', 'returns a thenable');
  promise.then(function() {
    assert.ok(adapter.serializer.deserializeIncluded.calledOnce, '#deserializeIncluded method called');
    done();
  });
});


test('#fetch handles 5xx (Server Error) response status', function(assert) {
  assert.expect(2);
  const done = assert.async();
  const adapter = this.subject({type: 'posts', url: '/posts'});
  sandbox.stub(window, 'fetch', function () {
    return Ember.RSVP.Promise.resolve({ "status": 500 });
  });
  let promise = adapter.fetch('/posts', { method: 'POST', body: 'json string here' });
  assert.ok(typeof promise.then === 'function', 'returns a thenable');
  promise.catch(function(error) {
    assert.equal(error.name, 'Server Error', '5xx response throws aa custom error');
    done();
  });
});

test('#fetch handles 4xx (Client Error) response status', function(assert) {
  assert.expect(4);
  const done = assert.async();
  const adapter = this.subject({type: 'posts', url: '/posts'});
  sandbox.stub(adapter, 'fetchUrl', function () {});
  sandbox.stub(window, 'fetch', function () {
    return Ember.RSVP.Promise.resolve({
      "status": 404,
      "json": function() {
        return Ember.RSVP.Promise.resolve({ errors: [ { code: 404 } ] });
      }
    });
  });
  let promise = adapter.fetch('/posts', { method: 'POST', body: 'json string here' });
  assert.ok(typeof promise.then === 'function', 'returns a thenable');
  promise.catch(function(error) {
    assert.ok(error.name, 'Client Error', '4xx response throws a custom error');
    assert.ok(Array.isArray(error.errors), '4xx error includes errors');
    assert.equal(error.errors[0].code, 404, '404 error code is in errors list');
    done();
  });
});

test('#fetch handles 204 (Success, no content) response status w/o calling deserialize/cacheResource', function(assert) {
  const adapter = this.subject({type: 'posts', url: '/posts'});
  sandbox.stub(adapter, 'fetchUrl', function () {});
  sandbox.stub(window, 'fetch', function () {
    return Ember.RSVP.Promise.resolve({
      "status": 204,
      "json": function() { return Ember.RSVP.Promise.resolve(''); }
    });
  });
  sandbox.stub(adapter, 'cacheResource', function () {});
  adapter.serializer = { deserialize: sandbox.spy(), deserializeIncluded: Ember.K };
  let promise = adapter.fetch('/posts', { method: 'PATCH', body: 'json string here' });
  assert.ok(typeof promise.then === 'function', 'returns a thenable');
  assert.equal(adapter.cacheResource.callCount, 0, '#cacheResource method NOT called');
  assert.equal(adapter.serializer.deserialize.callCount, 0, '#deserialize method NOT called');
});

test('#fetch handles 200 (Success) response status', function(assert) {
  assert.expect(3);
  const done = assert.async();
  const adapter = this.subject({type: 'posts', url: '/posts'});
  sandbox.stub(window, 'fetch', function () {
    return Ember.RSVP.Promise.resolve({
      "status": 200,
      "json": function() { return Ember.RSVP.Promise.resolve(postMock); }
    });
  });
  sandbox.stub(adapter, 'cacheResource', function () {});
  adapter.serializer = { deserialize: sandbox.spy(), deserializeIncluded: Ember.K };
  let promise = adapter.fetch('/posts/1', { method: 'GET' });
  assert.ok(typeof promise.then === 'function', 'returns a thenable');
  promise.then(function() {
    assert.ok(adapter.cacheResource.calledOnce, '#cacheResource method called');
    assert.ok(adapter.serializer.deserialize.calledOnce, '#deserialize method called');
    done();
  });
});

// This may only intermittently pass
skip('#initEvents', function(assert) {
  const proto = Adapter.PrototypeMixin.mixins[2].properties;
  sandbox.stub(proto, 'initEvents', function () { return; });
  let adapter = this.subject();
  assert.ok(proto.initEvents.calledOnce, 'initEvents called');
});
