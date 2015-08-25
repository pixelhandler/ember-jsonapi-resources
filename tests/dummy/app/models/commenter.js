import Ember from 'ember';
import Resource from './resource';
import { attr, hasMany } from 'ember-jsonapi-resources/models/resource';

export default Resource.extend({
  type: 'commenter',
  service: Ember.inject.service('commenters'),

  name: attr('string'),
  email: attr('string'),
  hash: attr(),

  comments: hasMany('comments')
});
