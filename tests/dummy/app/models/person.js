import Ember from 'ember';
import Resource from './resource';
import { attr } from 'ember-jsonapi-resources/models/resource';

export default Resource.extend({
  type: 'people',
  service: Ember.inject.service('people'),
  name: attr() // can use any value type for an attribute
});
