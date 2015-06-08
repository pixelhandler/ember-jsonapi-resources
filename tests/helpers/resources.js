import Resource from 'ember-jsonapi-resources/models/resource';
import { attr, hasOne, hasMany } from 'ember-jsonapi-resources/models/resource';

export const Post = Resource.extend({
  type: 'posts',
  title: attr(),
  excerpt: attr(),
  author: hasOne('author'),
  comments: hasMany('comments')
});

export const Author = Resource.extend({
  type: 'authors',
  name: attr(),
  posts: hasMany('posts')
});

export const Comment = Resource.extend({
  type: 'comments',
  body: attr(),
  commenter: hasOne('commenter'),
  post: hasOne('post')
});

export const Commenter = Resource.extend({
  type: 'commenters',
  name: attr(),
  comments: hasMany('comments')
});
