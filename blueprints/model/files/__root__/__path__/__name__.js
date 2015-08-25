import Ember from 'ember';
import Resource from './resource';
import { attr, hasOne, hasMany } from 'ember-jsonapi-resources/models/resource';

export default Resource.extend({
  type: '<%= resource %>',
  service: Ember.inject.service('<%= resource %>'),

  /*
  title: attr('string'),
  published: attr('date'),
  tags: attr('array'),
  footnotes: attr('object'),
  revisions: attr()
  version: attr('number'),
  "is-approved": attr('boolean'),

  author: hasOne('author'),
  comments: hasMany('comments')
  */
});
