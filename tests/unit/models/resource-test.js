import { moduleFor, test } from 'ember-qunit';
import Ember from 'ember';
import { pluralize } from 'ember-inflector';

import Resource from 'ember-jsonapi-resources/models/resource';
import { attr } from 'ember-jsonapi-resources/models/resource';
import { setup, teardown } from 'dummy/tests/helpers/resources';

let mockServices, sandbox;
const mockService = function () {
  return Ember.Service.extend({
    findRelated: sandbox.spy(function () { return Ember.RSVP.Promise.resolve(null); }),
    cacheLookup: sandbox.spy(function () { return []; })
  });
};
let entities = ['post', 'author'];

moduleFor('model:resource', 'Unit | Model | resource', {
  beforeEach() {
    setup.call(this);
    sandbox = window.sinon.sandbox.create();
    mockServices = {};
    entities.forEach(function (entity) {
      let serviceName = pluralize(entity);
      mockServices[serviceName] = mockService();
      this.container.register('service:'+serviceName, mockServices[serviceName]);
    }.bind(this));
  },
  afterEach() {
    mockServices = null;
    teardown();
    sandbox.restore();
  }
});

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
  let post = this.container.lookupFactory('model:posts').create({
    id: '1', attributes: {title: 'Wyatt Earp', excerpt: 'Was a gambler.'}
  });
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

test('hasOne() helper sets up a promise proxy to a related resource', function(assert) {
  let post = this.container.lookupFactory('model:posts').create({
    id: '1', attributes: { title: 'Wyatt Earp', excerpt: 'Was a gambler.'},
    relationships: {
      author: {
        data: { type: 'authors', id: '2' },
        links: {
          'self': 'http://api.pixelhandler.com/api/v1/posts/1/relationships/author',
          'related': 'http://api.pixelhandler.com/api/v1/posts/1/author'
        }
      },
    }
  });
  this.container.lookupFactory('model:authors').create({
    id: '2', attributes: { name: 'Bill' },
    relationships: {
      posts: {
        links: {
          "self": "http://api.pixelhandler.com/api/v1/authors/2/relationships/posts",
          "related": "http://api.pixelhandler.com/api/v1/authors/2/posts"
        }
      }
    }
  });
  let promise = post.get('author');
  assert.ok(promise.toString().match('ObjectProxy').length === 1, 'ObjectProxy used for hasOne relation');
});

test('hasMany() helper sets up a promise proxy to a related resource', function(assert) {
  let author = this.container.lookupFactory('model:authors').create({
    id: '1', attributes: { name: 'pixelhandler' },
    relationships: {
      posts: {
        links: {
          "self": "http://api.pixelhandler.com/api/v1/authors/1/relationships/posts",
          "related": "http://api.pixelhandler.com/api/v1/authors/1/posts"
        }
      }
    }
  });
  this.container.lookupFactory('model:posts').create({
    id: '2', attributes: { title: 'Wyatt Earp', excerpt: 'Was a gambler.'},
    relationships: {
      author: {
        data: { type: 'authors', id: '1' },
        links: {
          'self': 'http://api.pixelhandler.com/api/v1/posts/2/relationships/author',
          'related': 'http://api.pixelhandler.com/api/v1/posts/2/author'
        }
      },
    }
  });
  let promise = author.get('posts');
  assert.ok(promise.toString().match('ArrayProxy').length === 1, 'ArrayProxy used for hasMany relation');
});

test('#changedAttributes', function(assert) {
  let post = this.container.lookupFactory('model:posts').create({
    attributes: {id: '1', title: 'Wyatt Earp', excerpt: 'Was a gambler.'}
  });
  assert.equal(post.get('excerpt'), 'Was a gambler.', 'excerpt is set "Was a gambler."');
  post.set('excerpt', 'Became a deputy.');
  assert.equal(post.get('excerpt'), 'Became a deputy.', 'excerpt is set to "Became a deputy."');

  let changed = post.get('changedAttributes');
  assert.equal(Ember.keys(changed).join(''), 'excerpt', 'changed attributes include only excerpt');
  assert.equal(changed.excerpt, 'Became a deputy.', 'change excerpt value is "Became a deputy."');
});

test('#previousAttributes', function(assert) {
  let post = this.container.lookupFactory('model:posts').create({
    id: '1', attributes: {title: 'Wyatt Earp', excerpt: 'Was a gambler.'}
  });
  assert.equal(post.get('excerpt'), 'Was a gambler.', 'title is set toGambler');
  post.set('excerpt', 'Became a deputy.');
  assert.equal(post.get('excerpt'), 'Became a deputy.', 'excerpt is set to "Became a deputy."');

  let previous = post.get('previousAttributes');
  assert.equal(Ember.keys(previous).join(''), 'excerpt', 'previous attributes include only excerpt');
  assert.equal(previous.excerpt, 'Was a gambler.', 'previous excerpt value is "Became a deputy."');
});

test('#didUpdateResource empties the resource _attributes hash when resource id matches json arg id value', function(assert) {
  let post = this.container.lookupFactory('model:posts').create({
    id: '1', attributes: {title: 'Wyatt Earp', excerpt: 'Was a gambler.'}
  });
  post.set('excerpt', 'became a deputy.');
  assert.equal(Ember.keys(post.get('_attributes')).length, 1, 'one changed attribute present before didUpdateResource called');
  post.didUpdateResource({id: '1'});
  assert.equal(Ember.keys(post.get('_attributes')).length, 0, 'no changed attribute present after didUpdateResource called');
});

test('#didUpdateResource does nothing if json argument has an id that does not match the resource id', function(assert) {
  let post = this.container.lookupFactory('model:posts').create({
    id: '1', attributes: {title: 'Wyatt Earp', excerpt: 'Was a gambler.'}
  });
  post.set('excerpt', 'became a deputy.');
  assert.equal(Ember.keys(post.get('_attributes')).length, 1, 'one changed attribute present before didUpdateResource called');
  post.didUpdateResource({id: 'not-1'});
  assert.equal(Ember.keys(post.get('_attributes')).length, 1, 'one changed attribute still present after didUpdateResource called');
});

test('#addRelationship', function(assert) {
  let post = this.container.lookupFactory('model:posts').create({
    id: '1', attributes: {title: 'Wyatt Earp', excerpt: 'Was a gambler.'}
  });
  post.addRelationship('author', '2');
  let authorRelation = '{"author":{"links":{},"data":{"type":"authors","id":"2"}},"comments":{"links":{},"data":[]}}';
  assert.equal(JSON.stringify(post.get('relationships')), authorRelation, 'added relationship for author');
  let comment = this.container.lookupFactory('model:comments').create({
    id: '4',  attributes: {body: 'Wyatt become a deputy too.' },
    relationships: { commenter: { data: { type: 'commenter', id: '3' } } }
  });
  let commenterRelation = '{"commenter":{"data":{"type":"commenter","id":"3"},"links":{}},"post":{"links":{},"data":null}}';
  assert.equal(JSON.stringify(comment.get('relationships')), commenterRelation, 'added commenter relationship to comment');

  post.addRelationship('comments', '4');
  let postRelations = '{"author":{"links":{},"data":{"type":"authors","id":"2"}},"comments":{"links":{},"data":[{"type":"comments","id":"4"}]}}';
  assert.equal(JSON.stringify(post.get('relationships')), postRelations, 'added relationship for comment');
});

test('#removeRelationship', function(assert) {
  let post = this.container.lookupFactory('model:posts').create({
    id: '1', attributes: {title: 'Wyatt Earp', excerpt: 'Was a gambler.'},
    relationships: {
      author: { data: { type: 'authors', id: '2' } },
      comments: { data: [{ type: 'comments', id: '4' }] }
    }
  });
  let author = this.container.lookupFactory('model:authors').create({
    id: '2', attributes: { name: 'Bill' },
    relationships: {
      posts: { data: [{ type: 'posts', id: '1' }] }
    }
  });
  let commenter = this.container.lookupFactory('model:commenters').create({
    id: '3', attributes: { name: 'Virgil Erp' },
    relationships: {
      comments: { data: [{ type: 'comments', id: '4' }] }
    }
  });
  let comment = this.container.lookupFactory('model:comments').create({
    id: '4', attributes: { body: 'Wyatt become a deputy too.' },
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

// This may only intermittently pass
QUnit.skip('#initEvents', function(assert) {
  const proto = Resource.PrototypeMixin.mixins[1].properties;
  window.sinon.stub(proto, 'initEvents', function () { return; });
  let Factory = this.container.lookupFactory('model:posts');
  Factory.create({ attributes: { id: '1', title: 'Wyatt Earp', excerpt: 'Was a gambler.'} });
  assert.ok(proto.initEvents.calledOnce, 'initEvents called');
});

test('#cacheDuration default value is 7 minutes', function(assert) {
  const resource = this.subject();
  assert.equal(resource.get('cacheDuration'), 420000, '420000 milliseconds is default cache duration');
});

test('#isCacheExpired is true when local timestamp plus cacheDuration is now or in the past', function(assert) {
  const resource = this.subject({
    id: '1',
    meta: { timeStamps: { local: Date.now() - 420000 } },
    cacheDuration: 420000
  });
  assert.ok(resource.get('isCacheExpired'), 'cache duration is past');
});

test('#isCacheExpired is false when local timestamp plus cacheDuration is less than now', function(assert) {
  const resource = this.subject({
    id: '1',
    meta: { timeStamps: { local: Date.now() - 419000 } },
    cacheDuration: 420000
  });
  assert.equal(resource.get('isCacheExpired'), false, 'cache duration is in the future');
});
