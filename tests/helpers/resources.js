import Ember from 'ember';
import RSVP from 'rsvp';

import PostResource       from 'dummy/models/post';
import AuthorResource     from 'dummy/models/author';
import CommentResource    from 'dummy/models/comment';
import CommenterResource  from 'dummy/models/commenter';
import PersonResource     from 'dummy/models/person';
import EmployeeResource   from 'dummy/models/employee';
import SupervisorResource from 'dummy/models/supervisor';
// Even though unused, keep PictureResource here for clarity. (shut up jshint!)
import PictureResource    from 'dummy/models/picture'; // jshint ignore:line

// Remove the service from resources. We're using mock services.
export const Post       = PostResource.extend({service: null});
export const Author     = AuthorResource.extend({service: null});
export const Comment    = CommentResource.extend({service: null});
export const Commenter  = CommenterResource.extend({service: null});
export const Person     = PersonResource.extend({service: null});
export const Employee   = EmployeeResource.extend({service: null});
export const Supervisor = SupervisorResource.extend({service: null});

export function setup() {
  let opts = { instantiate: false, singleton: false };
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

export function teardown() {}
