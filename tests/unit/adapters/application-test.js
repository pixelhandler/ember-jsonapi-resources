import { moduleFor, test } from 'ember-qunit';
import Adapter from 'ember-jsonapi-resources/adapters/application';
import Ember from 'ember';
import RSVP from 'rsvp';
import { setup, teardown, mockServices } from 'dummy/tests/helpers/resources';

import postMock from 'fixtures/api/posts/1';
import postsMock from 'fixtures/api/posts';
import authorMock from 'fixtures/api/authors/1';

let sandbox;

function RSVPonerror(error) {
  throw new Error(error);
}

moduleFor('adapter:application', 'Unit | Adapter | application', {
  beforeEach() {
    setup.call(this);
    sandbox = window.sinon.sandbox.create();
    RSVP.configure('onerror', RSVPonerror);
    window.localStorage.removeItem('AuthorizationHeader');
  },
  afterEach() {
    teardown();
    sandbox.restore();
    window.localStorage.removeItem('AuthorizationHeader');
  }
});

test('#find calls #findOne when options arg is a string', function(assert) {
  assert.expect(3);
  const done = assert.async();

  const adapter = this.subject();
  sandbox.stub(adapter, 'findOne', function () { return RSVP.Promise.resolve(null); });
  let promise = adapter.find('1');

  assert.ok(typeof promise.then === 'function', 'returns a thenable');
  promise.then(() => {
    assert.ok(adapter.findOne.calledOnce, 'findOne called');
    assert.ok(adapter.findOne.calledWith('1'), 'findOne called with "1"');
    done();
  });
});

test('#find casts options arg of type number to string', function (assert) {
  assert.expect(3);
  const done = assert.async();

  const adapter = this.subject();
  sandbox.stub(adapter, 'findOne', function () { return RSVP.Promise.resolve(null); });
  let id = 0;
  let promise = adapter.find(id);

  assert.ok(typeof promise.then === 'function', 'returns a thenable');
  promise.then(() => {
    assert.ok(adapter.findOne.calledOnce, 'findOne called');
    assert.ok(adapter.findOne.calledWith(id.toString()), 'findOne called with number id cast to string');
    done();
  });
});

test('#find calls #findOne when options arg is an object having an id property', function(assert) {
  assert.expect(3);
  const done = assert.async();

  const adapter = this.subject();
  sandbox.stub(adapter, 'findOne', function () { return RSVP.Promise.resolve(null); });
  let options = {id: '1', query: {sort: '-date'}};
  let promise = adapter.find(options);

  assert.ok(typeof promise.then === 'function', 'returns a thenable');
  promise.then(() => {
    assert.ok(adapter.findOne.calledOnce, 'findOne called');
    assert.ok(
      adapter.findOne.calledWith('1', options.query),
      'findOne called with `"1"` and query `{"sort": "-date"}`'
    );
    done();
  });
});

test('#find casts options.id to string before calling #findOne', function (assert) {
  assert.expect(3);
  const done = assert.async();

  const adapter = this.subject();
  sandbox.stub(adapter, 'findOne', function () { return RSVP.Promise.resolve(null); });
  let options = {id: 0, query: {sort: '-date'}};
  let promise = adapter.find(options);

  assert.ok(typeof promise.then === 'function', 'returns a thenable');
  promise.then(() => {
    assert.ok(adapter.findOne.calledOnce, 'findOne called');
    assert.ok(adapter.findOne.calledWith(options.id.toString()), 'findOne called with number id cast to string');
    done();
  });

});
test('#find calls #findQuery when options arg is an object without an id property', function(assert) {
  assert.expect(3);
  const done = assert.async();

  const adapter = this.subject();
  sandbox.stub(adapter, 'findQuery', function () { return RSVP.Promise.resolve(null); });
  let options = {query: {sort: '-date'}};
  let promise = adapter.find(options);

  assert.ok(typeof promise.then === 'function', 'returns a thenable');
  promise.then(() => {
    assert.ok(adapter.findQuery.calledOnce, 'findQuery called');
    assert.ok(
      adapter.findQuery.calledWith(options),
      'findQuery called with query `{"sort": "-date"}`'
    );
    done();
  });
});

test('#find calls #findQuery when options arg is undefined', function(assert) {
  assert.expect(3);
  const done = assert.async();

  const adapter = this.subject();
  sandbox.stub(adapter, 'findQuery', function () { return RSVP.Promise.resolve(null); });
  let promise = adapter.find(undefined);

  assert.ok(typeof promise.then === 'function', 'returns a thenable');
  promise.then(() => {
    assert.ok(adapter.findQuery.calledOnce, 'findQuery called');
    assert.ok(adapter.findQuery.calledWith(undefined), 'findQuery called with undefined');
    done();
  });
});

test('#findOne calls #fetch with url and options object with method:GET', function(assert) {
  assert.expect(3);
  const done = assert.async();

  const adapter = this.subject({type: 'posts', url: '/posts'});
  sandbox.stub(adapter, 'fetch', function () { return RSVP.Promise.resolve(null); });
  let promise = adapter.findOne('1');

  assert.ok(typeof promise.then === 'function', 'returns a thenable');
  promise.then(() => {
    assert.ok(adapter.fetch.calledOnce, 'fetch called');
    assert.ok(
      adapter.fetch.calledWith('/posts/1', { method: 'GET' }),
      'fetch called with url and method:GET'
    );
    done();
  });
});

test('#findQuery calls #fetch url and options object with method:GET', function(assert) {
  assert.expect(3);
  const done = assert.async();

  const adapter = this.subject({type: 'posts', url: '/posts'});
  sandbox.stub(adapter, 'fetch', function () { return RSVP.Promise.resolve(null); });
  let promise = adapter.findQuery();

  assert.ok(typeof promise.then === 'function', 'returns a thenable');
  promise.then(() => {
    assert.ok(adapter.fetch.calledOnce, 'fetch called');
    assert.ok(
      adapter.fetch.calledWith('/posts', {method: 'GET'}),
      'fetch called with url and method:GET'
    );
    done();
  });
});

test('#findQuery calls #fetch url including a query', function(assert) {
  assert.expect(3);
  const done = assert.async();

  const adapter = this.subject({type: 'posts', url: '/posts'});
  sandbox.stub(adapter, 'fetch', function () { return RSVP.Promise.resolve(null); });
  let promise = adapter.findQuery({ query: { sort:'-desc' } });

  assert.ok(typeof promise.then === 'function', 'returns a thenable');
  promise.then(() => {
    assert.ok(adapter.fetch.calledOnce, 'fetch called');
    assert.ok(
      adapter.fetch.calledWith('/posts?sort=-desc', {method: 'GET'}),
      'fetch called with url?query and method:GET'
    );
    done();
  });
});

test('#findRelated', function(assert) {
  assert.expect(3);
  const done = assert.async();

  // Resource to findRelated on.
  let resource   = this.container.lookup('model:post').create(postMock.data);
  let relatedUrl = resource.get('relationships.author.links.related');
  const adapter  = this.subject({type: 'posts', url: '/posts'});

  // We expect the authors service to be used.
  this.registry.register('service:authors', Adapter.extend({type: 'authors', url: '/authors'}));
  let service = this.container.lookup('service:authors');
  sandbox.stub(service, 'fetch', function () { return RSVP.Promise.resolve(related); });

  // The related resource we expect to find.
  let related = this.container.lookup('model:author').create(authorMock.data);

  let promise = adapter.findRelated('author', relatedUrl);

  assert.ok(typeof promise.then === 'function', 'returns a thenable');
  promise.then(() => {
    assert.ok(service.fetch.calledOnce, 'authors service#fetch method called');
    assert.ok(
      service.fetch.calledWith(relatedUrl, {method: 'GET'}),
      'url for relation passed to service#fetch'
    );
    done();
  });
});

test('#findRelated is called with optional type for the resource', function (assert) {
  assert.expect(4);
  const done = assert.async();
  let supervisor = this.container.lookup('model:supervisor').create({
    type: 'supervisors',
    id: '1000000',
    attributes: {
      name: 'The Boss',
    },
    relationships: {
      employees: {
        links: {
          related: 'http://api.pixelhandler.com/api/v1/supervisors/1000000/employees'
        }
      }
    }
  });

  let EmployeeAdapter = Adapter.extend({type: 'employees', url: '/employees'});
  this.registry.register('service:supervisors', EmployeeAdapter.extend({
    cacheLookup: function() {
      return supervisor;
    }
  }));
  EmployeeAdapter.reopenClass({ isServiceFactory: true });
  this.registry.register('service:employees', EmployeeAdapter.extend());
  let service = this.container.lookup('service:employees');
  let stub = sandbox.stub(service, 'findRelated', function () {
    return RSVP.Promise.resolve(supervisor);
  });
  let employee = this.container.lookup('model:employee').create({
    type: 'employees',
    id: '1000001',
    attributes: {
      name: 'The Special',
    },
    relationships: {
      supervisor: {
        links: {
          related: 'http://api.pixelhandler.com/api/v1/employees/1000001/supervisor'
        }
      }
    }
  });
  let url = employee.get('relationships.supervisor.links.related');
  employee.get('supervisor').then(() => {
    assert.ok(stub.calledOnce, 'employees service findRelated method called once');
    assert.equal(stub.firstCall.args[0].resource, 'supervisor', 'findRelated called with supervisor resource');
    assert.equal(stub.firstCall.args[0].type, 'employees', 'findRelated called with employees type');
    assert.equal(stub.firstCall.args[1], url, 'findRelated called with url, ' + url);
    done();
  });
});

test('#createResource', function(assert) {
  assert.expect(6);
  let done = assert.async();

  const adapter = this.subject({type: 'posts', url: '/posts'});
  // create new resource (without id, which "server" (response) assigns).
  let postFactory = this.container.lookup('model:post');
  let data = JSON.parse(JSON.stringify(postMock.data)); // clones postMock.data
  delete data.id;
  let newResource = postFactory.create(data);

  assert.equal(newResource.get('id'), null, 'new resource does not have an id');

  adapter.serializer = { serialize: function () { return data; } };
  let persistedResource = postFactory.create(postMock.data);
  sandbox.stub(adapter, 'fetch', function () { return RSVP.Promise.resolve(persistedResource); });
  let promise = adapter.createResource(newResource);

  assert.ok(typeof promise.then === 'function', 'returns a thenable');
  promise.then((resp) => {
    assert.ok(adapter.fetch.calledOnce, '#fetch method called');
    assert.ok(
      adapter.fetch.calledWith('/posts', {method: 'POST', body: JSON.stringify(data)}),
      '#fetch called with url and options with data'
    );
    assert.equal(newResource.get('id'), postMock.data.id, 'new resource now has an id');
    assert.deepEqual(resp, newResource, 'response is the same resource instance sent as arg');
    done();
  });
});

test('#updateResource', function(assert) {
  assert.expect(3);
  const done = assert.async();

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
  sandbox.stub(adapter, 'fetch', function () { return RSVP.Promise.resolve(null); });
  let resource = this.container.lookup('model:post').create(postMock.data);
  let promise = adapter.updateResource(resource);
  assert.ok(typeof promise.then === 'function', 'returns a thenable');
  promise.then(() => {
    assert.ok(adapter.fetch.calledOnce, '#fetch method called');
    assert.ok(
      adapter.fetch.calledWith(
        postMock.data.links.self,
        {method: 'PATCH', body: JSON.stringify(payload), update: true}
      ),
      '#fetch called with url and options with data'
    );
    done();
  });
});

test('when serializer returns null (nothing changed) #updateResource return promise is resolved with null', function(assert) {
  assert.expect(3);
  const done = assert.async();

  let adapter = this.subject({type: 'posts', url: '/posts'});
  adapter.serializer = { serializeChanged: function () { return null; } };
  sandbox.stub(adapter, 'fetch', function () { return RSVP.Promise.resolve(null); });
  let resource = this.container.lookup('model:post').create(postMock.data);
  let promise = adapter.updateResource(resource);

  assert.ok(typeof promise.then === 'function', 'returns a thenable');
  promise.then((resolution) => {
    assert.equal(resolution, null, 'null returned instead of ');
    assert.ok(!adapter.fetch.called, '#fetch method NOT called');
    done();
  });
});

test('#createRelationship (to-many)', function(assert) {
  assert.expect(2);
  const done = assert.async();

  mockServices.call(this);
  let adapter = this.subject({type: 'posts', url: '/posts'});
  sandbox.stub(adapter, 'fetch', function () { return RSVP.Promise.resolve(null); });
  let resource = this.container.lookup('model:post').create(postMock.data);
  let promise = adapter.createRelationship(resource, 'comments', '1');

  assert.ok(typeof promise.then === 'function', 'returns a thenable');
  promise.then(() => {
    let jsonBody = JSON.stringify({data: [{type: 'comments', id: '1'}]});
    assert.ok(
      adapter.fetch.calledWith(
        postMock.data.relationships.comments.links.self,
        {method: 'POST', body: jsonBody}
      ),
      '#fetch called with url and options with data'
    );
    done();
  });
});

test('#createRelationship (to-one)', function(assert) {
  assert.expect(2);
  const done = assert.async();

  const adapter = this.subject({type: 'posts', url: '/posts'});
  mockServices.call(this);
  sandbox.stub(adapter, 'fetch', function () { return RSVP.Promise.resolve(null); });
  let resource = this.container.lookup('model:post').create(postMock.data);
  let promise = adapter.createRelationship(resource, 'author', '1');

  assert.ok(typeof promise.then === 'function', 'returns a thenable');
  promise.then(() => {
    let jsonBody = JSON.stringify({data: {type: 'authors', id: '1'}});
    assert.ok(
      adapter.fetch.calledWith(
        postMock.data.relationships.author.links.self,
        {method: 'POST', body: jsonBody}
      ),
      '#fetch called with url and options with data'
    );
    done();
  });
});

test('#deleteRelationship (to-many)', function(assert) {
  assert.expect(2);
  const done = assert.async();

  mockServices.call(this);
  let adapter = this.subject({type: 'posts', url: '/posts'});
  sandbox.stub(adapter, 'fetch', function () { return RSVP.Promise.resolve(null); });
  let resource = this.container.lookup('model:post').create(postMock.data);
  let promise = adapter.deleteRelationship(resource, 'comments', '1');

  assert.ok(typeof promise.then === 'function', 'returns a thenable');
  promise.then(() => {
    let jsonBody = JSON.stringify({data: [{type: 'comments', id: '1'}]});
    assert.ok(
      adapter.fetch.calledWith(
        postMock.data.relationships.comments.links.self,
        {method: 'DELETE', body: jsonBody}
      ),
      '#fetch called with url and options with data'
    );
    done();
  });
});

test('#deleteRelationship (to-one)', function(assert) {
  assert.expect(2);
  const done = assert.async();

  mockServices.call(this);
  const adapter = this.subject({type: 'posts', url: '/posts'});
  sandbox.stub(adapter, 'fetch', function () { return RSVP.Promise.resolve(null); });
  let resource = this.container.lookup('model:post').create(postMock.data);
  let promise = adapter.deleteRelationship(resource, 'author', '1');

  assert.ok(typeof promise.then === 'function', 'returns a thenable');
  promise.then(() => {
    let jsonBody = JSON.stringify({data: {type: 'authors', id: '1'}});
    assert.ok(
      adapter.fetch.calledWith(
        postMock.data.relationships.author.links.self,
        {method: 'DELETE', body: jsonBody}
      ),
      '#fetch called with url and options with data'
    );
    done();
  });
});

test('#patchRelationship (to-many)', function(assert) {
  assert.expect(2);
  const done = assert.async();

  mockServices.call(this);
  let adapter = this.subject({type: 'posts', url: '/posts'});
  sandbox.stub(adapter, 'fetch', function () { return RSVP.Promise.resolve(null); });
  let resource = this.container.lookup('model:post').create(postMock.data);
  resource.addRelationship('comments', '1');
  let promise = adapter.patchRelationship(resource, 'comments');

  assert.ok(typeof promise.then === 'function', 'returns a thenable');
  promise.then(() => {
    let jsonBody = JSON.stringify({data: [{type: 'comments', id: '1'}]});
    assert.ok(
      adapter.fetch.calledWith(
        postMock.data.relationships.comments.links.self,
        {method: 'PATCH', body: jsonBody}
      ),
      '#fetch called with url and options with data'
    );
    done();
  });
});

test('#patchRelationship (to-one)', function(assert) {
  assert.expect(2);
  const done = assert.async();

  mockServices.call(this);
  const adapter = this.subject({type: 'posts', url: '/posts'});
  sandbox.stub(adapter, 'fetch', function () { return RSVP.Promise.resolve(null); });
  let resource = this.container.lookup('model:post').create(postMock.data);
  resource.addRelationship('author', '1');
  let promise = adapter.patchRelationship(resource, 'author');

  assert.ok(typeof promise.then === 'function', 'returns a thenable');
  promise.then(() => {
    let jsonBody = JSON.stringify({data: {type: 'authors', id: '1'}});
    assert.ok(
      adapter.fetch.calledWith(
        postMock.data.relationships.author.links.self,
        {method: 'PATCH', body: jsonBody}
      ),
      '#fetch called with url and options with data'
    );
    done();
  });
});

// Even though create- and deleteRelationship both use _payloadForRelationship,
// which does the casting of id to String, we test them seperately to ensure this
// is always tested, even when internals change.
test('createRelationship casts id to string', function (assert) {
  assert.expect(2);
  const done = assert.async();

  mockServices.call(this);
  const adapter = this.subject({type: 'posts', url: '/posts'});
  sandbox.stub(adapter, 'fetch', function () { return RSVP.Promise.resolve(null); });
  let resource = this.container.lookup('model:post').create(postMock.data);
  let createPromise = adapter.createRelationship(resource, 'comments', 1);
  let deletePromise = adapter.deleteRelationship(resource, 'comments', 1);

  let jsonBody = JSON.stringify({data: [{type: 'comments', id: '1'}]});
  createPromise.then(() => {
    assert.ok(
      adapter.fetch.calledWith(
        postMock.data.relationships.comments.links.self,
        {method: 'POST', body: jsonBody}
      ),
      '#createRelationship casts id to String'
    );
    return deletePromise;
  }).then(() => {
    assert.ok(
      adapter.fetch.calledWith(
        postMock.data.relationships.comments.links.self,
        {method: 'DELETE', body: jsonBody}
      ),
      '#deleteRelationship casts id to String'
    );
    done();
  });
});


test('#deleteResource can be called with a string as the id for the resource', function(assert) {
  assert.expect(2);
  const done = assert.async();

  const adapter = this.subject({type: 'posts', url: '/posts'});
  sandbox.stub(adapter, 'fetch', function () { return RSVP.Promise.resolve(null); });
  let promise = adapter.deleteResource('1');

  assert.ok(typeof promise.then === 'function', 'returns a thenable');
  promise.then(() => {
    assert.ok(
      adapter.fetch.calledWith('/posts/1', {method: 'DELETE'}),
      '#fetch called with url'
    );
    done();
  });
});

test('#deleteResource can be called with a resource having a self link, and calls resource#destroy', function(assert) {
  assert.expect(3);
  const done = assert.async();

  const adapter = this.subject({type: 'posts', url: '/posts'});
  sandbox.stub(adapter, 'fetch', function () { return RSVP.Promise.resolve(null); });
  let resource = this.container.lookup('model:post').create(postMock.data);
  sandbox.stub(resource, 'destroy', function () {});
  let promise = adapter.deleteResource(resource);

  assert.ok(typeof promise.then === 'function', 'returns a thenable');
  promise.then(() => {
    assert.ok(resource.destroy.calledOnce, 'resource#destroy method called');
    assert.ok(
      adapter.fetch.calledWith(postMock.data.links.self, {method: 'DELETE'}),
      '#fetch called with url'
    );
    done();
  });
});

test('when called with resource argument, #deleteResource calls #cacheRemove', function(assert) {
  assert.expect(1);
  const done = assert.async();

  const adapter = this.subject({type: 'posts', url: '/posts'});
  sandbox.stub(adapter, 'fetch', function () { return RSVP.Promise.resolve(null); });
  let resource = this.container.lookup('model:post').create(postMock.data);
  sandbox.stub(adapter, 'cacheRemove', function () {});
  Ember.run(() => {
    adapter.deleteResource(resource);
  });

  assert.ok(adapter.cacheRemove.calledOnce, 'adapter#cacheRemove called');
  done();
});

test('#fetch calls #fetchURL to customize if needed', function(assert) {
  assert.expect(2);
  const done = assert.async();

  const adapter = this.subject({type: 'posts', url: '/posts'});
  sandbox.stub(adapter, 'fetchUrl', function () {});
  sandbox.stub(window, 'fetch', function () {
    return RSVP.Promise.resolve({
      "status": 204,
      "text": function() { return RSVP.Promise.resolve(''); }
    });
  });
  let url     = '/posts';
  let promise = adapter.fetch(url, {method: 'PATCH', body: 'json string here'});

  assert.ok(typeof promise.then === 'function', 'returns a thenable');
  promise.then(() => {
    assert.ok(adapter.fetchUrl.calledWith(url), '#fetchUrl called with url');
    done();
  });
});

test('#fetch calls #fetchOptions checking if the request is an update, if true skips call to deserialize', function(assert) {
  assert.expect(3);
  const done = assert.async();

  const adapter = this.subject({type: 'posts', url: '/posts'});
  sandbox.stub(adapter, 'fetchUrl', function () {});
  sandbox.stub(window, 'fetch', function () {
    return RSVP.Promise.resolve({
      "status": 202,
      "json": function() {
        return RSVP.Promise.resolve({data: {}, meta: {}});
      }
    });
  });
  sandbox.stub(adapter, 'cacheResource', function () {});
  adapter.serializer = { deserialize: sandbox.spy(), transformAttributes: sandbox.spy() };
  let promise = adapter.fetch('/posts', {method: 'PATCH', body: 'json string here', update: true});

  assert.ok(typeof promise.then === 'function', 'returns a thenable');
  promise.then(() => {
    assert.ok(!adapter.serializer.deserialize.called, '#deserialize method NOT called');
    assert.ok(adapter.serializer.transformAttributes.calledOnce, '#transformAttributes method called once');
    done();
  });
});

test('#fetchUrl', function(assert) {
  const adapter = this.subject();
  let url = '/posts';
  assert.equal(adapter.fetchUrl(url), url, 'returns url');
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
    return RSVP.Promise.resolve({
      "status": 200,
      "json": function() {
        return RSVP.Promise.resolve(postsMock);
      }
    });
  });
  let promise = adapter.fetch('/posts/1', {method: 'GET'});

  assert.ok(typeof promise.then === 'function', 'returns a thenable');
  promise.then(() => {
    assert.ok(adapter.cacheResource.calledOnce, '#cacheResource method called');
    done();
  });
});

test('#cacheUpdate called after #updateResource success', function(assert) {
  assert.expect(2);
  const done = assert.async();

  const adapter = this.subject();
  sandbox.stub(adapter, 'cacheUpdate', function () {});
  sandbox.stub(window, 'fetch', function () {
    return RSVP.Promise.resolve({
      "status": 200,
      "json": function() {
        return RSVP.Promise.resolve(postsMock);
      }
    });
  });
  let payload = {
    data: {
      type: postMock.data.type,
      id: postMock.data.id,
      attributes: {
        title: postMock.data.attributes.title + ' changed'
      }
    }
  };
  adapter.serializer = {
    serializeChanged: function () { return payload; },
    transformAttributes: function(json) { return json; }
  };
  let resource = this.container.lookup('model:post').create(postMock.data);
  let promise = adapter.updateResource(resource);

  assert.ok(typeof promise.then === 'function', 'returns a thenable');
  promise.then(() => {
    assert.ok(adapter.cacheUpdate.calledOnce, '#cacheUpdate method called');
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
    return RSVP.Promise.resolve({
      "status": 200,
      "json": function() {
        return RSVP.Promise.resolve(postMock);
      }
    });
  });
  let promise = adapter.fetch('/posts/1', { method: 'GET' });
  assert.ok(typeof promise.then === 'function', 'returns a thenable');
  promise.then(() => {
    assert.ok(adapter.serializer.deserializeIncluded.calledOnce, '#deserializeIncluded method called');
    done();
  });
});


test('#fetch handles 5xx (ServerError) response status', function(assert) {
  assert.expect(3);
  const done = assert.async();

  const adapter = this.subject({type: 'posts', url: '/posts'});
  sandbox.stub(window, 'fetch', function () {
    return RSVP.Promise.resolve({
      "status": 500,
      "text": function() {
        return RSVP.Promise.resolve('');
      }
    });
  });
  let promise = adapter.fetch('/posts', {method: 'POST', body: 'json string here'});

  assert.ok(typeof promise.then === 'function', 'returns a thenable');
  promise.catch((error) => {
    assert.equal(error.name, 'ServerError', '5xx response throws a custom error');
    assert.equal(error.code, 500, 'error code 500');
    done();
  });
});

test('#fetch handles 4xx (Client Error) response status', function(assert) {
  assert.expect(5);
  const done = assert.async();

  const adapter = this.subject({type: 'posts', url: '/posts'});
  const mockError = {errors: [{status: 404, title: 'I am an error'}]};
  sandbox.stub(adapter, 'fetchUrl', function () {});
  sandbox.stub(window, 'fetch', function () {
    return RSVP.Promise.resolve({
      "status": 404,
      "text": function() {
        return RSVP.Promise.resolve(JSON.stringify(mockError));
      }
    });
  });
  let promise = adapter.fetch('/posts', { method: 'POST', body: 'json string here' });
  assert.ok(typeof promise.then === 'function', 'returns a thenable');
  promise.catch((error) => {
    assert.ok(error.name, 'Client Error', '4xx response throws a custom error');
    assert.equal(error.code, 404, 'error code 404 from response status');
    assert.ok(Array.isArray(error.errors), 'response includes errors from `text`');
    assert.deepEqual(error.errors, mockError.errors, 'response errors object intact');
    done();
  });
});

test('#fetch handles 204 (Success, no content) response status w/o calling deserialize/cacheResource', function(assert) {
  assert.expect(3);
  const done = assert.async();

  const adapter = this.subject({type: 'posts', url: '/posts'});
  sandbox.stub(adapter, 'fetchUrl', function () {});
  sandbox.stub(window, 'fetch', function () {
    return RSVP.Promise.resolve({
      "status": 204,
      "text": function() { return RSVP.Promise.resolve(''); }
    });
  });
  sandbox.stub(adapter, 'cacheResource', function () {});
  adapter.serializer = {deserialize: sandbox.spy(), deserializeIncluded: Ember.K};
  let promise = adapter.fetch('/posts', {method: 'PATCH', body: 'json string here'});

  assert.ok(typeof promise.then === 'function', 'returns a thenable');
  promise.then(() => {
    assert.ok(!adapter.cacheResource.called, '#cacheResource method NOT called');
    assert.ok(!adapter.serializer.deserialize.called, '#deserialize method NOT called');
    done();
  });
});

test('#fetch handles 200 (Success) response status', function(assert) {
  assert.expect(3);
  const done = assert.async();

  const adapter = this.subject({type: 'posts', url: '/posts'});
  sandbox.stub(window, 'fetch', function () {
    return RSVP.Promise.resolve({
      "status": 200,
      "json": function() { return RSVP.Promise.resolve(postMock); }
    });
  });
  sandbox.stub(adapter, 'cacheResource', function () {});
  adapter.serializer = { deserialize: sandbox.spy(), deserializeIncluded: Ember.K };
  let promise = adapter.fetch('/posts/1', { method: 'GET' });

  assert.ok(typeof promise.then === 'function', 'returns a thenable');
  promise.then(() => {
    assert.ok(adapter.cacheResource.calledOnce, '#cacheResource method called');
    assert.ok(adapter.serializer.deserialize.calledOnce, '#deserialize method called');
    done();
  });
});

test('it uses the authorization mixin to define the property authorizationCredential', function(assert) {
  const credential = 'supersecrettokenthatnobodycancrack';
  window.localStorage.setItem('AuthorizationHeader', credential);
  const adapter = this.subject();

  assert.equal(
    adapter.get('authorizationCredential'),
    credential,
    'authorizationCredential property reads localStorage["AuthorizationHeader"] value'
  );
});

test('#fetchAuthorizationHeader sets Authorization option for #fetch', function(assert) {
  const adapter = this.subject({});
  let credential = 'supersecrettokenthatnobodycancrack';
  adapter.set('authorizationCredential', credential);
  let option = {headers: {}};
  adapter.fetchAuthorizationHeader(option);

  assert.equal(
    option.headers['Authorization'],
    credential,
    'Authorization header set to' + credential
  );
});

test('#fetchAuthorizationHeader uses an option passed in by caller', function(assert) {
  const adapter = this.subject();
  let option = {headers: {"Authorization": "secretToken"}};
  adapter.fetchAuthorizationHeader(option);

  assert.equal(
    option.headers['Authorization'],
    "secretToken",
    'Authorization header set to "secretToken"'
  );
});

test('re-opening AuthorizationMixin can customize the settings for Authorization credentials', function(assert) {
  const credential = '{"secure":{"access_token":"SecretToken"}}';
  window.localStorage.setItem('ember_simple_auth:session', credential);
  const adapter = this.subject();
  /*
    In a test reopening a mixin is sticky so mimicing the same behavior by reopening
    the adapter instance, in an app the AuthorizationMixin instance should be
    re-opened to configure custom authorization credentials

    ```
    import AuthorizationMixin from 'ember-jsonapi-resources/mixins/authorization';
    AuthorizationMixin.reopen({
      authorizationHeaderStorageKey: ...
      authorizationCredential: ...
    });
    ```

    The example below should work for using ember-simple-auth…
  */
  adapter.reopen({
    authorizationHeaderStorageKey: 'ember_simple_auth:session',
    authorizationCredential: Ember.computed({
      get(key) {
        key = this.get('authorizationHeaderStorageKey');
        const simpleAuthSession = JSON.parse(window.localStorage.getItem(key));
        return 'Bearer ' + simpleAuthSession.secure.access_token;
      }
    })
  });
  assert.equal(adapter.get('authorizationCredential'), 'Bearer SecretToken');
});
