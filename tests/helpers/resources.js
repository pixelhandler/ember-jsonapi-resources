import Resource from 'ember-jsonapi-resources/models/resource';
import { attr, hasOne, hasMany } from 'ember-jsonapi-resources/models/resource';
import Ember from 'ember';
import RSVP from 'rsvp';

export const Post = Resource.extend({
  type: 'posts',
  title: attr('string'),
  excerpt: attr('string'),
  "updated-at": attr('date'),
  "created-at": attr('date'),
  author: hasOne('author'),
  comments: hasMany('comments')
});

export const Author = Resource.extend({
  type: 'authors',
  name: attr('string'),
  posts: hasMany('posts')
});

export const Comment = Resource.extend({
  type: 'comments',
  body: attr('string'),
  commenter: hasOne('commenter'),
  post: hasOne('post')
});

export const Commenter = Resource.extend({
  type: 'commenters',
  name: attr('string'),
  comments: hasMany('comments')
});

export const Person = Resource.extend({
  type: 'people',
  name: attr() // can use any value type for an attribute
});

export const Employee = Person.extend({
  type: 'employees',
  supervisor: hasOne({ resource: 'supervisor', type: 'people' })
});

export const Supervisor = Employee.extend({
  type: 'supervisors',
  directReports: hasMany({ resource: 'employees', type: 'people' })
});

export function setup() {
  let opts = { instantiate: false, singleton: false };
  setupOwner.call(this);
  this.registry.register('model:post', Post, opts);
  this.registry.register('model:author', Author, opts);
  this.registry.register('model:comment', Comment, opts);
  this.registry.register('model:commenter', Commenter, opts);
  this.registry.register('model:person', Person, opts);
  this.registry.register('model:employee', Employee, opts);
  this.registry.register('model:supervisor', Supervisor, opts);
}

export function mockServices() {
  let types = Ember.String.w('posts authors comments commenters people employees supervisors');
  let mockService = Ember.Service.extend({
    cacheLookup(/*id*/) { return undefined; },
    findRelated() { return RSVP.resolve(null); }
  });
  for (let i = 0; i < types.length; i++) {
    this.registry.register('service:' + types[i], mockService);
  }
}

function setupOwner() {
  this._ogContainer = this.container;
  let ogLookup, ogLookupFactory;
  if (typeof Ember.getOwner === 'function') {
    this.container = this.owner || Ember.getOwner(this);
    ogLookup = this.container.lookup;
    ogLookupFactory = this.container._lookupFactory;
  } else {
    ogLookup = this._ogContainer.lookup;
    ogLookupFactory = this._ogContainer.lookupFactory;
  }
  this.container.lookup = function(factory) {
    if (factory.match(/^model/) !== null) {
      return ogLookupFactory.call(this, factory);
    } else {
      return ogLookup.call(this, factory);
    }
  };
}

export function teardown() {
  this.container = this._ogContainer;
  delete this._ogContainer;
  delete Post.prototype.container;
  delete Author.prototype.container;
  delete Comment.prototype.container;
  delete Commenter.prototype.container;
}
