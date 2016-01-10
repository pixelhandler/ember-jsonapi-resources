import { moduleFor, test } from 'ember-qunit';
import Ember from 'ember';
import { pluralize } from 'ember-inflector';
import { setup, teardown } from 'dummy/tests/helpers/resources';

let mockServices;
const mockService = function () {
  let sandbox = this.sandbox;
  return Ember.Service.extend({
    findRelated: sandbox.spy(function () { return Ember.RSVP.Promise.resolve(Ember.Object.create({id: 1})); }),
    cacheLookup: sandbox.spy(function () { return Ember.A([]); })
  });
};
let entities = ['post', 'author'];

moduleFor('model:resource', 'Unit | Utility | hasOne', {
  beforeEach() {
    setup.call(this);
    this.sandbox = window.sinon.sandbox.create();
    mockServices = {};
    entities.forEach(function (entity) {
      let serviceName = pluralize(entity);
      mockServices[serviceName] = mockService.call(this);
      this.registry.register('service:'+serviceName, mockServices[serviceName]);
    }.bind(this));
  },
  afterEach() {
    mockServices = null;
    teardown();
    this.sandbox.restore();
  }
});

test('hasOne() helper sets up a promise proxy to a related resource', function(assert) {
  let post = this.container.lookup('model:post').create({
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
  this.container.lookup('model:author').create({
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
