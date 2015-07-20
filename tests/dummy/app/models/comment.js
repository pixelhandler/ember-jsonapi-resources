import Ember from 'ember';
import Resource from './resource';
import { attr, hasOne } from 'ember-jsonapi-resources/models/resource';

export default Resource.extend({
  type: 'comment',
  service: Ember.inject.service('comments'),

  body: attr(),

  date: Ember.computed('attributes', {
    get() {
      return this.get('attributes.created-at');
    }
  }),

  commenter: hasOne('commenter'),
  post: hasOne('post')
});
