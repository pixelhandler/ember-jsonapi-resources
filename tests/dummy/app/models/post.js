import Ember from 'ember';
import Resource from './resource';
import { attr, hasOne, hasMany } from 'ember-jsonapi-resources/models/resource';

export default Resource.extend({
  type: 'post',
  service: Ember.inject.service('posts'),

  title: attr(),
  date: attr(),
  excerpt: attr(),

  author: hasOne('author'),
  comments: hasMany('comments')
});
