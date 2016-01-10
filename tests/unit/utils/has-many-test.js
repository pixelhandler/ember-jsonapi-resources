import { moduleFor, test } from 'ember-qunit';
import Ember from 'ember';
import { pluralize } from 'ember-inflector';
import { setup, teardown } from 'dummy/tests/helpers/resources';

let mockServices;
const mockService = function () {
  let sandbox = this.sandbox;
  return Ember.Service.extend({
    findRelated: sandbox.spy(function () { return Ember.RSVP.Promise.resolve(Ember.A([Ember.Object.create({id: 1})])); }),
    cacheLookup: sandbox.spy(function () { return Ember.A([]); })
  });
};
let entities = ['post', 'author'];

moduleFor('model:resource', 'Unit | Utility | hasMany', {
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

test('hasMany() helper sets up a promise proxy to a related resource', function(assert) {
  let author = this.container.lookup('model:author').create({
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
  this.container.lookup('model:post').create({
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
