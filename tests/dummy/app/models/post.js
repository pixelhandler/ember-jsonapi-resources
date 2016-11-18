import Ember from 'ember';
import Resource from './resource';
import { attr, toOne, toMany } from 'ember-jsonapi-resources/models/resource';

export default Resource.extend({
  type: 'posts',
  service: Ember.inject.service('posts'),

  title: attr('string'),
  date: attr(),
  excerpt: attr('string'),

  author: toOne('author'),
  comments: toMany('comments')
});
