import Ember from 'ember';
import Resource from './resource';
import { attr, hasMany } from 'ember-jsonapi-resources/models/resource';

export default Resource.extend({
  type: 'employees',
  service: Ember.inject.service('employees'),

  name: attr('string'),

  pictures: hasMany('pictures')
});
