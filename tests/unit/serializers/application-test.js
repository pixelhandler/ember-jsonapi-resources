import { moduleFor, test } from 'ember-qunit';
import { setup, teardown, mockServices } from 'dummy/tests/helpers/resources';
import Ember from 'ember';
import authorMock from 'fixtures/api/authors/1';
import postMock from 'fixtures/api/posts/1';

let sandbox;

moduleFor('serializer:application', 'Unit | Serializer | application', {
  beforeEach() {
    setup.call(this);
    sandbox = window.sinon.sandbox.create();
  },
  afterEach() {
    teardown.call(this);
    sandbox.restore();
  }
});

test('#serialize sets up a top level `data` member for the primary data', function(assert) {
  const serializer = this.subject();
  sandbox.stub(serializer, 'serializeResource', function (json) { return json; });
  let resource = {};
  let json = serializer.serialize(resource);
  assert.ok(json.data, 'top level data member added');
});

test('#serialize calls serializeResource', function(assert) {
  const serializer = this.subject();
  sandbox.stub(serializer, 'serializeResource', function () {});
  let resource = {};
  serializer.serialize(resource);
  assert.ok(serializer.serializeResource.calledOnce, 'serializeResource called');
  assert.ok(serializer.serializeResource.calledWith(resource), 'serializeResource called with resource');
});

test('#serializeResource with only attributes data', function(assert) {
  const serializer = this.subject();
  let resource = Ember.getOwner(this)._lookupFactory('model:author').create({
    attributes: authorMock.data.attributes
  });
  let data = serializer.serializeResource(resource);
  assert.equal(data.id, undefined, 'id not serialized it is undefined');
  assert.equal(data.type, authorMock.data.type, 'type serialized ok');
  let expected = data.attributes.name;
  let actual = authorMock.data.attributes.name;
  assert.equal(actual, expected, 'name serialized ok');
  expected = data.attributes.email;
  actual = authorMock.data.attributes.email;
  assert.equal(actual, expected, 'email serialized ok');
  assert.equal(data.relationships.post, undefined, 'related post not serialized ');
});

test('#serializeResource with attributes and relationship', function(assert) {
  const serializer = this.subject();
  mockServices.call(this);
  let resource = Ember.getOwner(this)._lookupFactory('model:post').create({
    attributes: postMock.data.attributes
  });
  resource.addRelationship('author', '1');
  let data = serializer.serializeResource(resource);
  assert.equal(data.id, undefined, 'id not serialized it is undefined');
  assert.equal(data.type, postMock.data.type, 'type serialized ok');
  let expected = data.attributes.title;
  let actual = postMock.data.attributes.title;
  assert.equal(actual, expected, 'title serialized ok');
  expected = data.attributes.excerpt;
  actual = postMock.data.attributes.excerpt;
  assert.equal(actual, expected, 'excerpt serialized ok');
  assert.ok(data.relationships.author, 'related author serialized');
  assert.ok(data.relationships.author.data, 'related author data serialized');
  assert.ok(data.relationships.author.data.type, 'authors', 'related author type serialized');
  assert.equal(data.relationships.author.data.id, '1', 'related author id serialized');
});

test('#serializeChanged', function(assert) {
  const serializer = this.subject();
  let resource = Ember.getOwner(this)._lookupFactory('model:post').create(postMock.data);
  let changedTitle = postMock.data.attributes.title + ' changed';
  resource.set('title', changedTitle);
  let serialized = serializer.serializeChanged(resource);
  let actual = Object.keys(serialized.data.attributes).length;
  assert.equal(actual, 1, 'only 1 attribute is serialized.');
  actual = Object.keys(serialized.data.attributes)[0];
  assert.equal(actual, 'title', 'only the changed title is serialized.');
  actual = serialized.data.attributes.title;
  assert.equal(actual, changedTitle, 'title is serialized with changed value');
});

test('when #serializedChanged has nothing to return', function(assert) {
  const serializer = this.subject();
  let resource = Ember.getOwner(this)._lookupFactory('model:post').create(postMock.data);
  let serialized = serializer.serializeChanged(resource);
  assert.equal(serialized, null, 'null is returned when there are no changed attributes');
});

test('#serializeRelationship', function(assert) {
  const serializer = this.subject();
  mockServices.call(this);
  let post = createPost.call(this);
  let json = serializer.serializeRelationship(post, 'author');
  assert.deepEqual(json, { data: { type: 'authors', id: '2' } }, 'author serialized');
  json = serializer.serializeRelationship(post, 'comments');
  assert.deepEqual(json, { data: [{ type: 'comments', id: '3' }] }, 'comments serialized');
});

test('#serializeRelationships', function(assert) {
  const serializer = this.subject();
  mockServices.call(this);
  let post = createPost.call(this);
  let json = serializer.serializeRelationships(post, ['author', 'comments']);
  assert.deepEqual(json, {
    author: { data: { type: 'authors', id: '2' } },
    comments: { data: [{ type: 'comments', id: '3' }] }
  }, 'author and comments relationships serialized');
});

function createPost() {
  return Ember.getOwner(this)._lookupFactory('model:post').create({
    id: '1', attributes: {
      title: 'Wyatt Earp', excerpt: 'Was a gambler.'
    },
    relationships: {
      author: {
        data: { type: 'authors', id: '2' }, links: { related: 'url' }
      },
      comments: {
        data: [{ type: 'comments', id: '3' }], links: { related: 'url' }
      }
    }
  });
}

test('With data as an object #deserialize calls #deserializeResource', function(assert) {
  const serializer = this.subject();
  sandbox.stub(serializer, 'deserializeResource', function () {});
  let resource = { data: { id: '1' } };
  serializer.deserialize(resource);
  assert.ok(serializer.deserializeResource.calledOnce, 'deserializeResource called');
  assert.ok(serializer.deserializeResource.calledWith(resource.data), 'deserializeResource called with resource');
});

test('With data as an Array #deserialize calls #deserializeResources', function(assert) {
  const serializer = this.subject();
  sandbox.stub(serializer, 'deserializeResources', function () {});
  let resources = { data: [{id: '1'}, {id: '2'}] };
  serializer.deserialize(resources);
  assert.ok(serializer.deserializeResources.calledOnce, 'deserializeResource called');
  assert.ok(serializer.deserializeResources.calledWith(resources.data), 'deserializeResource called with authorMock.data');
});

test('#deserializeResources calls deserializeResource for each item in a collection', function(assert) {
  const serializer = this.subject();
  sandbox.stub(serializer, 'deserializeResource', function () {});
  let resources = { data: [0,1,2] };
  serializer.deserializeResources(resources.data);
  assert.ok(serializer.deserializeResource.calledThrice, 'deserializeResources called deserializeResource 3 times');
  let msg = 'deserializeResource called with resource: ';
  for (let i = 0; i < resources.data.length; i++) {
    assert.ok(serializer.deserializeResource.calledWith(i), msg + i);
  }
});

test('#deserializeResource', function(assert) {
  const serializer = this.subject();
  let resource = serializer.deserializeResource(postMock.data);
  assert.ok(resource, 'resource created');
  assert.equal(resource.get('id'), postMock.data.id, 'id present in resource');
  assert.equal(resource.get('type'), postMock.data.type, 'type present in resource');
  assert.equal(resource.get('title'), postMock.data.attributes.title, 'title present in resource');
  assert.equal(resource.get('excerpt'), postMock.data.attributes.excerpt, 'excerpt present in resource');
  assert.equal(resource.toString(), '[JSONAPIResource|post:1]');
});

test('#deserializeIncluded', function(assert) {
  const MockService = function (name) {
    this.cache = { data: [] };
    this.serializer = { deserializeResource: window.sinon.expectation.create(name + '#deserializeResource') };
    this.cacheResource = window.sinon.expectation.create(name + '#cacheResource');
    return this;
  };
  let mocks = {
    authors: new MockService('authors'),
    comments: new MockService('comments')
  };
  this.registry.register('service:authors', mocks.authors, {instantiate: false});
  this.registry.register('service:comments', mocks.comments, {instantiate: false});

  const serializer = this.subject();
  serializer.deserializeIncluded(postMock.included, { headers:{} });

  let msg = 'service authors.serializer#deserializeResource called';
  assert.ok(mocks.authors.serializer.deserializeResource.calledOnce, msg);
  msg = 'service authors#cacheResource called';
  assert.ok(mocks.authors.cacheResource.calledOnce, msg);
  msg = 'included author deserialized';
  assert.ok(mocks.authors.serializer.deserializeResource.calledWith(postMock.included[0]), msg);

  msg = 'service comments.serializer#deserializeResource called';
  assert.ok(mocks.comments.serializer.deserializeResource.calledOnce, msg);
  msg = 'service comments#cacheResource called';
  assert.ok(mocks.comments.cacheResource.calledOnce, msg);
  msg = 'included comment deserialized';
  assert.ok(mocks.comments.serializer.deserializeResource.calledWith(postMock.included[1]), msg);
});

test('#transformAttributes calls date type transform methods', function(assert) {
  const serializer = this.subject();
  sandbox.stub(serializer, 'deserializeDateAttribute');
  serializer.transformAttributes(postMock.data);
  let msg = 'called attribute type transform method: deserializeDateAttribute';
  assert.ok(serializer.deserializeDateAttribute.called, msg);

  sandbox.stub(serializer, 'serializeDateAttribute');
  serializer.transformAttributes(postMock.data, 'serialize');
  msg = 'called attribute type transform method: serializeDateAttribute';
  assert.ok(serializer.serializeDateAttribute.called, msg);
});

test('#serializeDateAttribute', function(assert) {
  const serializer = this.subject();
  let dateString = "2015-08-25T00:00:00.000Z";
  let serializedDate = serializer.serializeDateAttribute(new Date(dateString));
  assert.equal(serializedDate, dateString, 'serialized created-at Date to ISO String');
});

test('#deserializeDateAttribute', function(assert) {
  const serializer = this.subject();
  let dateString = "2015-08-25T00:00:00.000Z";
  let date = new Date(dateString);
  let deserialized = serializer.deserializeDateAttribute(dateString);
  assert.equal(deserialized.valueOf(), date.valueOf(), 'deserialized created-at from ISO String to Date');
});

test('#transformAttributes calls attribute transform methods', function(assert) {
  const serializer = this.subject();
  serializer.reopen({
    serializeFullNameAttribute(value) {
      return value.split('written by: ')[1];
    },
    deserializeFullNameAttribute(value) {
      return 'written by: ' + value;
    },
  });

  let payloadNameAttr = authorMock.data.attributes['full-name'];
  sandbox.spy(serializer, 'deserializeFullNameAttribute');
  let data = serializer.transformAttributes(authorMock.data, 'deserialize');
  let msg = 'called attribute transform method: deserializeFullNameAttribute';
  assert.ok(serializer.deserializeFullNameAttribute.called, msg);
  assert.equal(data.attributes['full-name'], 'written by: ' + payloadNameAttr, 'deserialized full-name attr');

  sandbox.spy(serializer, 'serializeFullNameAttribute');
  data = serializer.transformAttributes(data, 'serialize');
  msg = 'called attribute transform method: serializeFullNameAttribute';
  assert.ok(serializer.serializeFullNameAttribute.called, msg);
  assert.equal(payloadNameAttr, data.attributes['full-name'], 'deserialized full-name attr');
});
