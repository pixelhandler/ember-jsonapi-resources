import Resource from 'ember-jsonapi-resources/models/resource';
import { attr, hasOne, hasMany } from 'ember-jsonapi-resources/models/resource';

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
  const opts = { instantiate: false, singleton: false };
  Post.prototype.container = this.container;
  this.registry.register('model:post', Post, opts);
  Author.prototype.container = this.container;
  this.registry.register('model:author', Author, opts);
  Comment.prototype.container = this.container;
  this.registry.register('model:comment', Comment, opts);
  Commenter.prototype.container = this.container;
  this.registry.register('model:commenter', Commenter, opts);
  Person.prototype.container = this.container;
  this.registry.register('model:person', Person, opts);
  Employee.prototype.container = this.container;
  this.registry.register('model:employee', Employee, opts);
  Supervisor.prototype.container = this.container;
  this.registry.register('model:supervisor', Supervisor, opts);
}

export function teardown() {
  delete Post.prototype.container;
  delete Author.prototype.container;
  delete Comment.prototype.container;
  delete Commenter.prototype.container;
}
