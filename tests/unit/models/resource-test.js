import { moduleFor, test } from 'ember-qunit';
import Ember from 'ember';
import Resource from 'ember-jsonapi-resources/models/resource';
import { attr, hasOne, hasMany } from 'ember-jsonapi-resources/models/resource';
import { Post, Author, Comment, Commenter } from 'dummy/tests/helpers/resources';

moduleFor('model:resource', 'Unit | Model | resource');

test('it creates an instance, default flag for isNew is false', function(assert) {
  const resource = this.subject();
  assert.ok(!!resource);
  assert.equal(resource.get('isNew'), false, 'default value for isNew flag set to `false`');
});

test('#toString method', function(assert) {
  const resource = this.subject();
  let stringified = resource.toString();
  assert.equal(stringified, '[JSONAPIResource|(null):(null)]', 'resource.toString() is ' + stringified);
  resource.setProperties({id: '1', type: 'post'});
  stringified = resource.toString();
  assert.equal(stringified, '[JSONAPIResource|post:1]', 'resource.toString() is ' + stringified);
});

test('it has the same attributes as JSON API 1.0 Resource objects', function(assert) {
  const resource = this.subject();
  let attrs = Ember.String.w('type id attributes relationships links meta');
  attrs.forEach(function (attr) {
    var val = resource.get(attr);
    assert.notStrictEqual(val, undefined, attr + ' is `'+ val +'` not undefined');
  });
});

test('it has methods to add/remove relationships', function(assert) {
  const resource = this.subject();
  let methods = Ember.String.w('addRelationship removeRelationship');
  methods.forEach(function (method) {
    assert.ok(typeof resource[method] === 'function', 'resource#' + method + ' is a function');
  });
});

test('it has properties for changed/previous attributes', function(assert) {
  const resource = this.subject();
  let attrs = Ember.String.w('changedAttributes previousAttributes');
  attrs.forEach(function (attr) {
    var val = resource.get(attr);
    assert.notStrictEqual(val, undefined, attr + ' is `'+ val +'` not undefined');
  });
});

test('it has methods for communication on an event bus with service', function(assert) {
  const resource = this.subject();
  let methods = Ember.String.w('initEvents didUpdateResource');
  methods.forEach(function (method) {
    assert.ok(typeof resource[method] === 'function', 'resource#' + method + ' is a function');
  });
});

test('it needs a reference to an injected service object', function(assert) {
  const resource = this.subject();
  assert.ok(resource.get('service') === null, 'resource#service is null by default');
});

test('attr() uses the attributes hash for computed model attributes', function(assert) {
  let post = Post.create({ attributes: {id: '1', title: 'Wyatt Earp', excerpt: 'Was a gambler.'} });
  assert.equal(post.get('title'), 'Wyatt Earp', 'name is set to "Wyatt Earp"');
  assert.equal(post.get('excerpt'), 'Was a gambler.', 'excerpt is set to "Was a gambler."');

  assert.equal(post.get('attributes.title'), 'Wyatt Earp');
  assert.equal(post.get('attributes.excerpt'), 'Was a gambler.');
});

test('attr() helper creates a computed property using a unique (protected) attributes hash', function(assert) {
  const Factory = this.container.lookupFactory('model:resource');
  const PersonFactory = Factory.extend({ name: attr() });

  let personA = PersonFactory.create({ attributes: { 'name': 'Ricky' } });
  assert.equal(personA.get('name'), 'Ricky', 'personA name is set to Ricky');

  let personB = PersonFactory.create();
  assert.equal(personB.get('name'), undefined, 'personB name is NOT set to Ricky');

  const PersonResource = Resource.extend({ name: attr() });
  let personC = PersonResource.create({ attributes: { 'name': 'Lucy' } });
  assert.equal(personC.get('name'), 'Lucy', 'personC name is set to Lucy');

  let personD = PersonResource.create();
  assert.equal(personD.get('name'), undefined, 'personD name is NOT set to Lucy');

  const Actor = PersonResource.extend({ attributes: { show: attr() } });
  let lilRicky = Actor.create({ attributes: { 'name': 'Ricky Jr', 'show': 'I love Lucy' } });
  assert.equal(lilRicky.get('name'), 'Ricky Jr', 'lilRicky name is set to Ricky Jr');

  let otherLilRicky = Actor.create();
  assert.equal(otherLilRicky.get('name'), undefined, 'otherLilRicky name is NOT set to Ricky Jr');
});

test('#changedAttributes', function(assert) {
  let post = Post.create({ attributes: {id: '1', title: 'Wyatt Earp', excerpt: 'Was a gambler.'} });
  assert.equal(post.get('excerpt'), 'Was a gambler.', 'excerpt is set "Was a gambler."');
  post.set('excerpt', 'Became a deputy.');
  assert.equal(post.get('excerpt'), 'Became a deputy.', 'excerpt is set to "Became a deputy."');

  let changed = post.get('changedAttributes');
  assert.equal(Ember.keys(changed).join(''), 'excerpt', 'changed attributes include only excerpt');
  assert.equal(changed.excerpt, 'Became a deputy.', 'change excerpt value is "Became a deputy."');
});

test('#previousAttributes', function(assert) {
  let post = Post.create({ attributes: { id: '1', title: 'Wyatt Earp', excerpt: 'Was a gambler.'} });
  assert.equal(post.get('excerpt'), 'Was a gambler.', 'title is set toGambler');
  post.set('excerpt', 'Became a deputy.');
  assert.equal(post.get('excerpt'), 'Became a deputy.', 'excerpt is set to "Became a deputy."');

  let previous = post.get('previousAttributes');
  assert.equal(Ember.keys(previous).join(''), 'excerpt', 'previous attributes include only excerpt');
  assert.equal(previous.excerpt, 'Was a gambler.', 'previous excerpt value is "Became a deputy."');
});

test('#addRelationship', function(assert) {
  let post = Post.create({ attributes: {id: '1', title: 'Wyatt Earp', excerpt: 'Was a gambler.'} });
  let author = Author.create({ attributes: {id: '2', name: 'Bill'} });
  post.addRelationship('author', '2');
  let authorRelation = '{"author":{"links":{},"data":{"type":"authors","id":"2"}},"comments":{"links":{},"data":[]}}';
  assert.equal(JSON.stringify(post.get('relationships')), authorRelation, 'added relationship for author');
  let commenter = Commenter.create({ attributes: { id: '3', name: 'Virgil Erp' } });
  let comment = Comment.create({
    attributes: { id: '4', body: 'Wyatt become a deputy too.' },
    relationships: { commenter: { data: { type: 'commenter', id: '3' } } }
  });
  let commenterRelation = '{"commenter":{"data":{"type":"commenter","id":"3"},"links":{}},"post":{"links":{},"data":null}}';
  assert.equal(JSON.stringify(comment.get('relationships')), commenterRelation, 'added commenter relationship to comment');

  post.addRelationship('comments', '4');
  let postRelations = '{"author":{"links":{},"data":{"type":"authors","id":"2"}},"comments":{"links":{},"data":[{"type":"comments","id":"4"}]}}';
  assert.equal(JSON.stringify(post.get('relationships')), postRelations, 'added relationship for comment');
});

test('#removeRelationship', function(assert) {
  let post = Post.create({
    id: '1', title: 'Wyatt Earp', excerpt: 'Was a gambler.',
    relationships: {
      author: { data: { type: 'authors', id: '2' } },
      comments: { data: [{ type: 'comments', id: '4' }] }
    }
  });
  let author = Author.create({
    attributes: { id: '2', name: 'Bill' },
    relationships: {
      posts: { data: [{ type: 'posts', id: '1' }] }
    }
  });
  let commenter = Commenter.create({
    attributes: { id: '3', name: 'Virgil Erp' },
    relationships: {
      comments: { data: [{ type: 'comments', id: '4' }] }
    }
  });
  let comment = Comment.create({
    attributes: { id: '4', body: 'Wyatt become a deputy too.' },
    relationships: {
      commenter: { data: { type: 'commenter', id: '3' } },
      post: { data: { type: 'posts', id: '1' } }
    }
  });

  let authorRelations = '{"posts":{"data":[{"type":"posts","id":"1"}],"links":{}}}';
  assert.equal(JSON.stringify(author.get('relationships')), authorRelations, 'author relations have a post');

  let postRelations = '{"author":{"data":{"type":"authors","id":"2"},"links":{}},"comments":{"data":[{"type":"comments","id":"4"}],"links":{}}}';
  assert.equal(JSON.stringify(post.get('relationships')), postRelations, 'author relations have a post');

  let commentRelations = '{"commenter":{"data":{"type":"commenter","id":"3"},"links":{}},"post":{"data":{"type":"posts","id":"1"},"links":{}}}';
  assert.equal(JSON.stringify(comment.get('relationships')), commentRelations, 'comment relations have a commenter');

  let commenterRelations = '{"comments":{"data":[{"type":"comments","id":"4"}],"links":{}}}';
  assert.equal(JSON.stringify(commenter.get('relationships')), commenterRelations, 'commenter relations have a comment');

  post.removeRelationship('author', '2');
  postRelations = '{"author":{"data":null,"links":{}},"comments":{"data":[{"type":"comments","id":"4"}],"links":{}}}';
  assert.equal(JSON.stringify(post.get('relationships')), postRelations, 'removed author from post');

  post.removeRelationship('comments', '4');
  postRelations = '{"author":{"data":null,"links":{}},"comments":{"data":[],"links":{}}}';
  assert.equal(JSON.stringify(post.get('relationships')), postRelations, 'removed comment from post');

  author.removeRelationship('posts', '1');
  authorRelations = '{"posts":{"data":[],"links":{}}}';
  assert.equal(JSON.stringify(author.get('relationships')), authorRelations, 'removed a post from author');

  comment.removeRelationship('commenter', '3');
  commentRelations = '{"commenter":{"data":null,"links":{}},"post":{"data":{"type":"posts","id":"1"},"links":{}}}';
  assert.equal(JSON.stringify(comment.get('relationships')), commentRelations, 'removed a commenter from comment');
  comment.removeRelationship('post', '1');
  commentRelations = '{"commenter":{"data":null,"links":{}},"post":{"data":null,"links":{}}}';
  assert.equal(JSON.stringify(comment.get('relationships')), commentRelations, 'removed a post from comment');

  commenter.removeRelationship('comments', '4');
  commenterRelations = '{"comments":{"data":[],"links":{}}}';
  assert.equal(JSON.stringify(commenter.get('relationships')), commenterRelations, 'removed a comment from commenter');
});

QUnit.skip('#initEvents', function(assert) {
  const proto = Resource.PrototypeMixin.mixins[1].properties;
  window.sinon.stub(proto, 'initEvents', function () { return; });
  let post = Post.create({ attributes: { id: '1', title: 'Wyatt Earp', excerpt: 'Was a gambler.'} });
  assert.ok(proto.initEvents.calledOnce, 'initEvents called');
});
