import { moduleFor, test } from 'ember-qunit';
import Ember from 'ember';
import { Post, Author, Comment, Commenter } from 'dummy/tests/helpers/resources';

import authorMock from 'fixtures/api/authors/1';
import postMock from 'fixtures/api/posts/1';
import postsMock from 'fixtures/api/posts';

let sandbox;

moduleFor('serializer:application', 'Unit | Serializer | application', {
  beforeEach() {
    sandbox = window.sinon.sandbox.create();
  },
  afterEach() {
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
  let resource = Author.create({
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
  let resource = Post.create({
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
  let resource = Post.create(postMock.data);
  let changedTitle = postMock.data.attributes.title + ' changed';
  resource.set('title', changedTitle);
  let serialized = serializer.serializeChanged(resource);
  let actual = Ember.keys(serialized.data.attributes).length;
  assert.equal(actual, 1, 'only 1 attribute is serialized.');
  actual = Ember.keys(serialized.data.attributes)[0];
  assert.equal(actual, 'title', 'only the changed title is serialized.');
  actual = serialized.data.attributes.title;
  assert.equal(actual, changedTitle, 'title is serialized with changed value');
});

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
  this.container.register('model:posts', Post);
  let resource = serializer.deserializeResource(postMock.data);
  assert.ok(resource, 'resource created');
  assert.equal(resource.get('id'), postMock.data.id, 'id present in resource');
  assert.equal(resource.get('type'), postMock.data.type, 'type present in resource');
  assert.equal(resource.get('title'), postMock.data.attributes.title, 'title present in resource');
  assert.equal(resource.get('excerpt'), postMock.data.attributes.excerpt, 'excerpt present in resource');
  assert.equal(resource.toString(), '[JSONAPIResource|posts:1]');
});
