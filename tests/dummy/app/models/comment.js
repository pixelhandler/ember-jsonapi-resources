import Ember from 'ember';
import Resource from './resource';
import { attr, toOne } from 'ember-jsonapi-resources/models/resource';

export default Resource.extend({
  type: 'comments',
  service: Ember.inject.service('comments'),

  body: attr('string'),

  date: Ember.computed('attributes', {
    get() {
      return this.get('attributes.created-at');
    }
  }),

  commenter: toOne('commenter'),
  post: toOne('post')
});
