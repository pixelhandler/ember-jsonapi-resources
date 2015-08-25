import Ember from 'ember';
import Resource from './resource';
import { attr, hasOne } from 'ember-jsonapi-resources/models/resource';

export default Resource.extend({
  type: 'pictures',
  service: Ember.inject.service('pictures'),

  "name": attr('string'),
  "updated-at": attr('date'),
  "created-at": attr('date'),

  imageable: hasOne('imageable') // polymorphic
});
