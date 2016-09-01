import Ember from 'ember';
import Resource from './resource';
import { attr, hasOne, hasMany } from 'ember-jsonapi-resources/models/resource';

export default Resource.extend({
  type: 'posts',
  service: Ember.inject.service('posts'),

  title: attr('string'),
  date: attr(),
  excerpt: attr('string'),

  author: hasOne('author'),
  comments: hasMany('comments')
});
