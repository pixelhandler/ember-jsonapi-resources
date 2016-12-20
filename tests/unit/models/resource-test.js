import { moduleFor, test } from 'ember-qunit';
import RSVP from 'rsvp';
import Ember from 'ember';
import Resource from 'ember-jsonapi-resources/models/resource';
import { attr } from 'ember-jsonapi-resources/models/resource';
import { setup, teardown, mockServices } from 'dummy/tests/helpers/resources';

moduleFor('model:resource', 'Unit | Model | resource', {
  beforeEach() {
    setup.call(this);
    mockServices.call(this);
    let owner = Ember.getOwner(this);
    this.sandbox = window.sinon.sandbox.create();
    this.registry.register('model:resource', Resource, { instantiate: false });
    this._ogSubject = this.subject;
    this.subject = function(options) {
      let Factory = owner._lookupFactory('model:resource');
      Factory = Factory.extend({type: 'resource'});
      return Factory.create(options);
    };
  },
  afterEach() {
    teardown.call(this);
    this.sandbox.restore();
    this.registry.unregister('model:resource');
    this.subject = this._ogSubject;
  }
});

test('it creates an instance', function (assert) {
  let resource = this.subject();
  assert.ok(!!resource);
});

test('creating an instance WITHOUT id has flag for isNew set to true', function(assert) {
  let resource = this.subject();
  assert.equal(resource.get('isNew'), true, 'without id, default value for isNew flag set to `true`');
});

test('creating an instance WITH id has flag for isNew set to false', function(assert) {
  let resource = this.subject({id: 1});
  assert.equal(resource.get('isNew'), false, 'without id, default value for isNew flag set to `false`');
});

test('creating an instance allows isNew regardless of id/defaults', function (assert) {
  let notIsNewResource = this.subject({isNew: false});
  let yesIsNewResource = this.subject({id: 1, isNew: true});

  assert.equal(notIsNewResource.get('isNew'), false, 'without id, isNew property is honored');
  assert.equal(yesIsNewResource.get('isNew'), true, 'with id, isNew property is honored');
});

test('in creating instances, ids are cast to string', function (assert) {
  let id = 1;
  let post = createPost.call(this);
  assert.strictEqual(post.get('id'), id.toString(), 'new instance id cast to string');
});

test('in creating instances, optional resource is used to set up relationships', function (assert) {
  assert.expect(2);

  let supervisor = Ember.getOwner(this)._lookupFactory('model:supervisor').create();
  let meta       = supervisor.constructor.metaForProperty('directReports');
  let relationships = supervisor.get('relationships');

  assert.ok(!relationships.hasOwnProperty('directReports'), 'camelCased relation directReports does not exist');
  assert.ok(relationships.hasOwnProperty(meta.relation), 'relation "direct-reports" exists as defined as optional resource');
});

test('#toString method', function(assert) {
  let resource = this.subject();
  let stringified = resource.toString();
  assert.equal(stringified, '[JSONAPIResource|resource:null]', 'resource.toString() is ' + stringified);
  resource.setProperties({id: '1', type: 'posts'});
  stringified = resource.toString();
  assert.equal(stringified, '[JSONAPIResource|post:1]', 'resource.toString() is ' + stringified);
});

test('it has the same attributes as JSON API 1.0 Resource objects', function(assert) {
  let resource = this.subject();
  let attrs = Ember.String.w('type id attributes relationships links meta');
  attrs.forEach(function (attr) {
    var val = resource.get(attr);
    assert.notStrictEqual(val, undefined, attr + ' is `'+ val +'` not undefined');
  });
});

test('it has methods to add/remove relationships', function(assert) {
  let resource = this.subject();
  let methods = Ember.String.w('addRelationship removeRelationship');
  methods.forEach(function (method) {
    assert.ok(typeof resource[method] === 'function', 'resource#' + method + ' is a function');
  });
});

test('it has properties for changed/previous attributes', function(assert) {
  let resource = this.subject();
  let attrs = Ember.String.w('changedAttributes previousAttributes');
  attrs.forEach(function (attr) {
    var val = resource.get(attr);
    assert.notStrictEqual(val, undefined, attr + ' is `'+ val +'` not undefined');
  });
});

test('it needs a reference to an injected service object', function(assert) {
  let resource = this.subject();
  assert.ok(resource.get('service') === null, 'resource#service is null by default');
});

test('attr() uses the attributes hash for computed model attributes', function(assert) {
  let post = createPost.call(this);
  assert.equal(post.get('title'), 'Wyatt Earp', 'name is set to "Wyatt Earp"');
  assert.equal(post.get('excerpt'), 'Was a gambler.', 'excerpt is set to "Was a gambler."');

  assert.equal(post.get('attributes.title'), 'Wyatt Earp');
  assert.equal(post.get('attributes.excerpt'), 'Was a gambler.');
});

test('attr() helper creates a computed property using a unique (protected) attributes hash', function(assert) {
  const Factory = Ember.getOwner(this)._lookupFactory('model:resource');
  const PersonFactory = Factory.extend({ name: attr('string'), type: 'person' });

  let personA = PersonFactory.create({ attributes: { 'name': 'Ricky' }});
  assert.equal(personA.get('name'), 'Ricky', 'personA name is set to Ricky');

  let personB = PersonFactory.create();
  assert.equal(personB.get('name'), undefined, 'personB name is NOT set to Ricky');

  let personC = PersonFactory.create({ attributes: { 'name': 'Lucy' }});
  assert.equal(personC.get('name'), 'Lucy', 'personC name is set to Lucy');

  let personD = PersonFactory.create();
  assert.equal(personD.get('name'), undefined, 'personD name is NOT set to Lucy');

  const Actor = PersonFactory.extend({ show: attr(), type: 'person' });
  let lilRicky = Actor.create({ attributes: { 'name': 'Ricky Jr', 'show': 'I love Lucy' } });
  assert.equal(lilRicky.get('name'), 'Ricky Jr', 'lilRicky name is set to Ricky Jr');

  let otherLilRicky = Actor.create();
  assert.equal(otherLilRicky.get('name'), undefined, 'otherLilRicky name is NOT set to Ricky Jr');
});

test('#changedAttributes', function(assert) {
  let post = createPost.call(this);
  assert.equal(post.get('excerpt'), 'Was a gambler.', 'excerpt is set "Was a gambler."');
  post.set('excerpt', 'Became a deputy.');
  assert.equal(post.get('excerpt'), 'Became a deputy.', 'excerpt is set to "Became a deputy."');

  let changed = post.get('changedAttributes');
  assert.equal(Object.keys(changed).join(''), 'excerpt', 'changed attributes include only excerpt');
  assert.equal(changed.excerpt, 'Became a deputy.', 'change excerpt value is "Became a deputy."');
});

test('#previousAttributes', function(assert) {
  let post = createPost.call(this);
  assert.equal(post.get('excerpt'), 'Was a gambler.', 'excerpt is set to "Was a gambler."');
  post.set('excerpt', 'Became a deputy.');
  assert.equal(post.get('excerpt'), 'Became a deputy.', 'excerpt is set to "Became a deputy."');

  let previous = post.get('previousAttributes');
  assert.equal(Object.keys(previous).join(''), 'excerpt', 'previous attributes include only excerpt');
  assert.equal(previous.excerpt, 'Was a gambler.', 'previous excerpt value is "Was a gambler."');
});

test('#rollbackAttributes resets attributes based on #previousAttributes', function(assert) {
  let post = createPost.call(this);
  assert.equal(post.get('excerpt'), 'Was a gambler.', 'excerpt is set to "Was a gambler."');
  post.set('excerpt', 'Became a deputy.');
  assert.equal(post.get('excerpt'), 'Became a deputy.', 'excerpt is set to "Became a deputy."');
  let previous = post.get('previousAttributes');
  assert.equal(previous.excerpt, 'Was a gambler.', 'previous excerpt value is "Was a gambler."');
  assert.equal(Object.keys(previous).length, 1, 'previous attribues have one change tracked');

  post.rollbackAttributes();

  previous = post.get('previousAttributes');
  assert.equal(post.get('excerpt'), 'Was a gambler.', 'excerpt is set to "Was a gambler."');
  assert.equal(Object.keys(previous).length, 0, 'previous attribues are empty');
});

test('#rollbackRelationships resets relationships', function(assert) {
  let post = createPostWithRelationships.call(this);
  let ogAuthorId = post.get('relationships.author.data.id');
  let relationships = post.get('relationships');

  post.addRelationship('author', '5');
  assert.notEqual(relationships.author.id, ogAuthorId, 'author changed');

  assert.equal(relationships.comments.data.length, 1, 'one comment');
  post.removeRelationships('comments', ['3']);
  assert.equal(relationships.comments.data.length, 0, 'no comments');

  let changes = post.get('changedRelationships');
  assert.equal(changes.length, 2, 'two relationships were changed');

  post.rollbackRelationships();

  changes = post.get('changedRelationships');
  assert.equal(changes.length, 0, 'zero relationships were changed');
  relationships = post.get('relationships');
  assert.equal(relationships.author.data.id, ogAuthorId, 'author rolled back');
  assert.equal(relationships.comments.data.length, 1, 'one comment');
  assert.equal(relationships.comments.data[0].id, '3', 'comment rolled back');
});

test('#rollback resets attributes and relationships', function(assert){
  let post = createPostWithRelationships.call(this);
  post.set('excerpt', 'Became a deputy.');
  let previous = post.get('previousAttributes');
  assert.equal(Object.keys(previous).length, 1, 'previous attribues have one change tracked');

  post.addRelationship('author', '5');
  post.removeRelationships('comments', ['3']);
  let changes = post.get('changedRelationships');
  assert.equal(changes.length, 2, 'two relationships were changed');

  post.rollback();
  previous = post.get('previousAttributes');
  changes = post.get('changedRelationships');

  assert.equal(Object.keys(previous).length, 0, 'attribues rolled back');
  assert.equal(changes.length, 0, 'relationships rolled back');
});

test('#didUpdateResource empties the resource _attributes hash when resource id matches json arg id value', function(assert) {
  let post = Ember.getOwner(this)._lookupFactory('model:post').create({
    id: '1', attributes: {title: 'Wyatt Earp', excerpt: 'Was a gambler.'}
  });
  post.set('excerpt', 'became a deputy.');
  assert.equal(Object.keys(post.get('_attributes')).length, 1, 'one changed attribute present before didUpdateResource called');
  post.didUpdateResource({id: '1'});
  assert.equal(Object.keys(post.get('_attributes')).length, 0, 'no changed attribute present after didUpdateResource called');
});

test('#didUpdateResource does nothing if json argument has an id that does not match the resource id', function(assert) {
  let post = Ember.getOwner(this)._lookupFactory('model:post').create({
    id: '1', attributes: {title: 'Wyatt Earp', excerpt: 'Was a gambler.'}
  });
  post.set('excerpt', 'became a deputy.');
  assert.equal(Object.keys(post.get('_attributes')).length, 1, 'one changed attribute present before didUpdateResource called');
  post.didUpdateResource({id: 'not-1'});
  assert.equal(Object.keys(post.get('_attributes')).length, 1, 'one changed attribute still present after didUpdateResource called');
});

test('#relationMetadata', function(assert) {
  let post = Ember.getOwner(this)._lookupFactory('model:post').create({
    id: '1', attributes: { title: 'Wyatt Earp', excerpt: 'Was a gambler.' },
    relationships: {
      author: { data: { type: 'authors', id: '1' } },
      comments: [
        { data: { type: 'comments', id: '1' } }
      ]
    }
  });
  let metaData = post.relationMetadata('author');
  assert.ok(metaData.kind, 'toOne', 'meta kind is toOne');
  assert.ok(metaData.relation, 'author', 'meta relation is author');
  assert.ok(metaData.type, 'author', 'meta type is author');
  metaData = post.relationMetadata('comments');
  assert.ok(metaData.kind, 'toMany', 'meta kind is toMany');
  assert.ok(metaData.relation, 'comments', 'meta relation is comments');
  assert.ok(metaData.type, 'comments', 'meta type is comments');
});

test('#addRelationship', function(assert) {
  // create resource with relation from json payload.
  let comment = Ember.getOwner(this)._lookupFactory('model:comment').create({
    id: '4',  attributes: {body: 'Wyatt become a deputy too.' },
    relationships: { commenter: { data: { type: 'commenter', id: '3' } } }
  });
  let commenterRelation = {links: {}, data: {type: 'commenter', id: '3'}};
  assert.deepEqual(comment.get('relationships').commenter,
                   commenterRelation,
                  'created comment with commenter relationship from json payload');

  // create resource and add relationships through .addRelationship()
  // make sure both relationships exist after all manipulations.
  let post = Ember.getOwner(this)._lookupFactory('model:post').create({
    id: '1', attributes: {title: 'Wyatt Earp', excerpt: 'Was a gambler.'}
  });
  post.addRelationship('author', '2');
  let authorRelation = {links: {}, data: {type: 'authors', id: '2'}};
  post.addRelationship('comments', '4');
  let commentsRelation = {links: {}, data: [{type: 'comments', id: '4'}]};

  assert.deepEqual(post.get('relationships').author,
                   authorRelation,
                   'added author relationship to post');
  assert.deepEqual(post.get('relationships').comments,
                   commentsRelation,
                   'added relationship for comment to post');
});

test('#addRelationship cast id to string', function (assert) {
  let post = Ember.getOwner(this)._lookupFactory('model:post').create({
    id: '1', attributes: {title: 'Wyatt Earp', excerpt: 'Was a gambler.'}
  });
  post.addRelationship('author', 1);
  let authorRelation = {links: {}, data: {type: 'authors', id: '1'}};
  assert.deepEqual(post.get('relationships').author,
                   authorRelation,
                   'add relationship with id of type number gets converted to string');
});

test('#addRelationship tracks relationships changes', function(assert) {
  let post = Ember.getOwner(this)._lookupFactory('model:post').create({
    id: '1', attributes: {title: 'Wyatt Earp', excerpt: 'Was a gambler.'}
  });

  post.addRelationship('author', '1');
  assert.equal(post._relationships.author.previous, null, 'sets previous to null');
  assert.ok(post._relationships.author.changed, 'has reference for changed relation');
  assert.equal(post._relationships.author.changed.id, '1', 'changed id is 1');
  assert.equal(post._relationships.author.changed.type, 'authors', 'changed type is authors');

  let changed = post.get('changedRelationships');
  assert.equal(changed.length, 1, 'one changedRelationship');
  assert.equal(changed[0], 'author', 'changedRelationship is "author"');

  post.addRelationship('comments', '1');
  assert.ok(post._relationships.comments.added, 'comments relation added');
  assert.equal(post._relationships.comments.added.length, 1, 'one comments relation added');

  changed = post.get('changedRelationships');
  assert.equal(changed.length, 2, 'two changedRelationships');
  assert.equal(changed.filter(i => { return i==="comments"; }).length,
               '1', 'changedRelationships contains "comments"');

  post.addRelationship('comments', '2');
  assert.equal(post._relationships.comments.added.length, 2, 'two comments relation added');
});

test('#addRelationships', function(assert) {
  let post = Ember.getOwner(this)._lookupFactory('model:post').create({
    id: '1', attributes: {title: 'Wyatt Earp', excerpt: 'Was a gambler.'}
  });
  post.addRelationships('comments', ['4', '5']);
  let comments = post.get('relationships.comments.data');
  assert.ok(comments.mapBy('id').indexOf('4') !== -1, 'Comment id 4 added');
  assert.ok(comments.mapBy('id').indexOf('5') !== -1, 'Comment id 5 added');
  assert.equal(comments[0].type, 'comments', 'relation has comments type');
  assert.equal(comments[1].type, 'comments', 'relation has comments type');
  post.addRelationships('author', '2');
  let author = post.get('relationships.author.data');
  assert.equal(author.id, '2', 'Author id 2 added');
  assert.equal(author.type, 'authors', 'Author id 2 added');
});

test('#removeRelationship', function(assert) {
  // set up models and their relations through create with json payload.
  let post = createPostWithRelationships.call(this);
  let author = Ember.getOwner(this)._lookupFactory('model:author').create({
    id: '2', attributes: { name: 'Bill' },
    relationships: {
      posts: { data: [{ type: 'posts', id: '1' }], links: { related: 'url'} }
    }
  });
  let comment = Ember.getOwner(this)._lookupFactory('model:comment').create({
    id: '3', attributes: { body: 'Wyatt become a deputy too.' },
    relationships: {
      commenter: { data: { type: 'commenters', id: '4' }, links: { related: 'url'} },
      post: { data: { type: 'posts', id: '1' }, links: { related: 'url'} }
    }
  });
  let commenter = Ember.getOwner(this)._lookupFactory('model:commenter').create({
    id: '4', attributes: { name: 'Virgil Erp' },
    relationships: {
      comments: { data: [{ type: 'comments', id: '3' }], links: { related: 'url'} }
    }
  });

  // Test for correct representation of relationships.
  let authorPostsRelation = {
    data: [{type: 'posts', id: '1'}], links: { related: 'url' }
  };
  assert.deepEqual(author.get('relationships.posts'),
                   authorPostsRelation,
                   'author relations have a post (toMany)');

  let postAuthorRelation = {
    data: { type: 'authors', id: '2'}, links: { related: 'url' }
  };
  let postCommentsRelation = {
    data: [{ type: 'comments', id: '3'}], links: { related: 'url'}
  };
  assert.deepEqual(post.get('relationships.author'),
                   postAuthorRelation,
                   'post relations have an author (toOne)');
  assert.deepEqual(post.get('relationships.comments'),
                   postCommentsRelation,
                   'post relations have a comment (toMany)');

  let commentCommenterRelation = {
    data: {type: 'commenters', id: '4'}, links: { related: 'url'}
  };
  let commentPostRelation = {
    data: {type: 'posts', id: '1'}, links: { related: 'url'}
  };
  assert.deepEqual(comment.get('relationships.commenter'),
                   commentCommenterRelation,
                   'comment relations have a commenter (toOne)');
  assert.deepEqual(comment.get('relationships.post'),
                   commentPostRelation,
                   'comment relations have a post (toOne)');

  let commenterCommentsRelation = {data: [{type: 'comments', id: '3'}], links: { related: 'url'} };
  assert.deepEqual(commenter.get('relationships.comments'),
                   commenterCommentsRelation,
                   'commenter relations have a comment (toMany)');

  // Remove relationships and test for correct representation of relationships.

  post.removeRelationship('author', '2');
  // author relationship must still exist, but empty (toOne == null)
  postAuthorRelation.data = null;
  assert.deepEqual(post.get('relationships.author'),
                   postAuthorRelation,
                   'removed author from post, author relation now empty');
  // relationship to comments must be unchanged.
  assert.deepEqual(post.get('relationships.comments'),
                   postCommentsRelation,
                   'removed author from post, comments relation unchanged');

  post.removeRelationship('comments', '3');
  // comments relationship must still exist, but empty (toMany == empty array)
  postCommentsRelation.data = [];
  // author relationship must be unchanged.
  assert.deepEqual(post.get('relationships.comments'),
                   postCommentsRelation,
                   'removed comment from post, comments relation now empty');
  assert.deepEqual(post.get('relationships.author'),
                   postAuthorRelation,
                   'removed comment from post, author relation unchanged');

  author.removeRelationship('posts', '1');
  // posts relation must still exist, but empty (toMany == empty array)
  authorPostsRelation.data = [];
  assert.deepEqual(author.get('relationships.posts'),
                   authorPostsRelation,
                   'removed a post from author, posts relation now empty');

  comment.removeRelationship('commenter', '4');
  // comment relation must still exist, but empty (toOne == null)
  commentCommenterRelation.data = null;
  assert.deepEqual(comment.get('relationships.commenter'),
                   commentCommenterRelation,
                   'removed a commenter from comment, commenter relation now empty');
  assert.deepEqual(comment.get('relationships.post'),
                   commentPostRelation,
                   'removed a commenter from comment, post relation unchanged');

  comment.removeRelationship('post', '1');
  commentPostRelation.data = null;
  assert.deepEqual(comment.get('relationships.post'),
                   commentPostRelation,
                   'removed a post from comment, post relation now empty');
  assert.deepEqual(comment.get('relationships.commenter'),
                   commentCommenterRelation,
                   'removed a post from comment, commenter relation unchanged');

  commenter.removeRelationship('comments', '3');
  // comments relation must still exist, but empty (toMany == empty array)
  commenterCommentsRelation.data = [];
  assert.deepEqual(commenter.get('relationships.comments'),
                   commenterCommentsRelation,
                   'removed a comment from commenter, comments relation now empty');
});

test('#removeRelationship casts id to string', function (assert) {
  // set up model and its relations through create with json payload.
  let post = Ember.getOwner(this)._lookupFactory('model:post').create({
    id: '1', attributes: { title: 'Wyatt Earp', excerpt: 'Was a gambler.' },
    relationships: {
      comments: {
        data: [{ type: 'comments', id: '3' }, { type: 'comments', id: '4' }],
        links: { related: 'url' }
      }
    }
  });
  let postCommentsRelation = {
    data: [{ type: 'comments', id: '3' }], links: { related: 'url'}
  };
  post.removeRelationship('comments', 4);
  assert.deepEqual(post.get('relationships.comments'),
                   postCommentsRelation,
                   'comment relationship removed using number as id');
});

test('#removeRelationship tracks relationships changes', function(assert) {
  let post = createPostWithRelationships.call(this);
  post.removeRelationship('author', '2');
  assert.ok(post._relationships.author.previous, 'sets previous refence');
  assert.equal(post._relationships.author.previous.id, '2', 'previous id is 2');
  assert.equal(post._relationships.author.previous.type, 'authors',
    'previous type is authors');
  assert.equal(post._relationships.author.changed, null,
    'has reference for changed relation');

  post.removeRelationship('comments', '3');
  assert.ok(post._relationships.comments.removals, 'comments relation removed');
  assert.equal(post._relationships.comments.removals.length, 1,
    'one comments relation removed');
  assert.equal(post._relationships.comments.removals.get('firstObject.id'),
    '3', 'removed comment id "3"');
});

test('#removeRelationships', function(assert) {
  let post = createPostWithRelationships.call(this);
  post.removeRelationships('comments', ['3']);
  let comments = post.get('relationships.comments.data');
  assert.equal(comments.length, 0, 'remove comment relation');
  post.removeRelationships('author', '2');
  let author = post.get('relationships.author.data');
  assert.equal(author, null, 'removed author');
});

test('#changedRelationships', function(assert) {
  let post = createPostWithRelationships.call(this);
  post.addRelationship('author', '5');
  post.removeRelationships('comments', ['3']);
  let changes = post.get('changedRelationships');
  assert.equal(changes.length, 2, 'two relationships were changed');
  assert.ok(changes.indexOf('author') > -1, 'author relationship was changed');
  assert.ok(changes.indexOf('comments') > -1, 'comments relationship was changed');
});

test('#didResolveProxyRelation', function(assert) {
  let post = Ember.getOwner(this)._lookupFactory('model:post').create({
    id: '1', attributes: {title: 'Wyatt Earp', excerpt: 'Was a gambler.'},
    relationships: {
      author: { data: { type: 'authors', id: '2'}, links: { related: 'url-here'} }
    }
  });
  let author = Ember.getOwner(this)._lookupFactory('model:author').create({
    id: '2', attributes: { name: 'Bill' },
    relationships: {
      posts: { data: [{ type: 'posts', id: '1' }], links: { related: 'url-here'} }
    }
  });

  post.didResolveProxyRelation('author', 'toOne', author);

  assert.ok(post.get('relationships.author.data'), 'author data is setup');
  assert.equal(post.get('relationships.author.data.type'), 'authors', 'relation data set for authors type');
  assert.equal(post.get('relationships.author.data.id'), '2', 'relation data set with author id: 2');

  author.didResolveProxyRelation('posts', 'toMany', post);

  assert.ok(author.get('relationships.posts.data'), 'post data is setup');
  assert.equal(author.get('relationships.posts.data')[0].type, 'posts', 'relation data set for posts type');
  assert.equal(author.get('relationships.posts.data')[0].id, '1', 'relation data set with post id: 1');
});

test('#isNew resource uses relations without proxied content', function(assert) {
  let serviceOp = this.sandbox.spy();
  let post = Ember.getOwner(this)._lookupFactory('model:post').create({
    id: '1', attributes: {title: 'Wyatt Earp', excerpt: 'Was a gambler.'},
    isNew: true,
    // mock service
    service: { findRelated: serviceOp }
  });
  post.addRelationships('comments', ['4', '5']);
  let comments = post.get('comments');
  assert.equal(serviceOp.calledOnce, false, 'service#findRelated not called after adding to-many');
  assert.equal(comments.get('length'), 0, '0 comments');
  comments = post.get('relationships.comments.data');
  assert.equal(comments.length, 2, '2 items in comments data');

  post.addRelationships('author', '2');
  assert.equal(serviceOp.calledOnce, false, 'service#findRelated not called after adding to-one');
  let author = post.get('author');
  assert.equal(author.id, undefined, 'author id is undefined');
  author = post.get('relationships.author.data');
  assert.equal(author.id, 2, 'author data id is 2');
});

test('#cacheDuration default value is 7 minutes', function(assert) {
  let resource = this.subject();
  assert.equal(resource.get('cacheDuration'), 420000, '420000 milliseconds is default cache duration');
});

test('#isCacheExpired is true when local timestamp plus cacheDuration is now or in the past', function(assert) {
  let resource = this.subject({
    id: '1',
    meta: { timeStamps: { local: Date.now() - 420000 } },
    cacheDuration: 420000
  });
  assert.ok(resource.get('isCacheExpired'), 'cache duration is past');
});

test('#isCacheExpired is false when local timestamp plus cacheDuration is less than now', function(assert) {
  let resource = this.subject({
    id: '1',
    meta: { timeStamps: { local: Date.now() - 419000 } },
    cacheDuration: 420000
  });
  assert.equal(resource.get('isCacheExpired'), false, 'cache duration is in the future');
});

// TODO: Rewrite this test in tests/unit/mixins/resource-operations-test.js
test('#updateRelationship, from resource-operations mixin', function(assert) {
  let serviceOp = this.sandbox.spy(function() {
    return RSVP.Promise.resolve(null);
  });
  let post = Ember.getOwner(this)._lookupFactory('model:post').create({
    id: '1', attributes: { title: 'Wyatt Earp', excerpt: 'Was a gambler.' },
    relationships: {
      author: { data: { type: 'authors', id: '2' }, links: { related: 'url-here'} },
      comments: { data: [{ type: 'comments', id: '4' }], links: { related: 'url-here'} }
    },
    // mock service
    service: { patchRelationship: serviceOp }
  });
  let author = post.get('relationships.author.data');
  let comments = post.get('relationships.comments.data');
  let commentsIds = comments.map(comment => comment.id).sort();
  assert.equal(author.id, 2, 'post has author id 2');
  assert.deepEqual(commentsIds, ['4'], 'post has comments with id 4');

  post.updateRelationship('comments', ['4', '5']);
  comments = post.get('relationships.comments.data');
  commentsIds = comments.map(comment => comment.id).sort();
  assert.ok(serviceOp.calledOnce, 'service#patchRelationship called once');
  assert.equal(comments.length, 2, 'post has 2 comments');
  assert.deepEqual(commentsIds, ['4', '5'], 'post has comments with id 4 and 5');

  post.updateRelationship('comments', ['2', '5']);
  comments = post.get('relationships.comments.data');
  commentsIds = comments.map(comment => comment.id).sort();
  assert.ok(serviceOp.calledTwice, 'service#patchRelationship called once');
  assert.deepEqual(comments.length, 2, 'post has 2 comments');
  assert.deepEqual(commentsIds, ['2', '5'], 'post has comments with id 2 and 5');

  post.updateRelationship('comments', ['1', '2', '3', '4']);
  comments = post.get('relationships.comments.data');
  commentsIds = comments.map(comment => comment.id).sort();
  assert.equal(comments.length, 4, 'post has 4 comments');
  assert.deepEqual(commentsIds, ['1', '2', '3', '4'], 'post has comments with id 1, 2, 3 and 4');

  post.updateRelationship('comments', ['1', '2']);
  comments = post.get('relationships.comments.data');
  commentsIds = comments.map(comment => comment.id).sort();
  assert.equal(comments.length, 2, 'post has 2 comments');
  assert.deepEqual(commentsIds, ['1', '2'], 'post has comments with id 1 and 2');

  post.updateRelationship('comments', []);
  comments = post.get('relationships.comments.data');
  commentsIds = comments.map(comment => comment.id).sort();
  assert.equal(comments.length, 0, 'post has 0 comments');
  assert.deepEqual(commentsIds, [], 'post has not comments');

  post.updateRelationship('author', '1');
  author = post.get('relationships.author.data');
  assert.equal(author.id, 1, 'author id changed to 1');

  post.updateRelationship('author', null);
  author = post.get('relationships.author.data');
  assert.equal(author, null, 'author removed');
});

function createPost() {
  return Ember.getOwner(this)._lookupFactory('model:post').create({
    id: '1',
    attributes: { title: 'Wyatt Earp', excerpt: 'Was a gambler.' }
  });
}

function createPostWithRelationships() {
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

