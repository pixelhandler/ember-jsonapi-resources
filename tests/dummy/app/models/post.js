import Ember from 'ember';
import Resource from 'ember-jsonapi-resources/models/resource';
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
