import Ember from 'ember';
import Resource from 'ember-jsonapi-resources/models/resource';
import { attr, hasMany } from 'ember-jsonapi-resources/models/resource';

export default Resource.extend({
  type: 'author',
  service: Ember.inject.service('authors'),

  name: attr(),
  email: attr(),

  posts: hasMany('posts')
});
