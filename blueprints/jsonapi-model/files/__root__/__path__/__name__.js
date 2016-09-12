import Ember from 'ember';
import Resource from 'ember-jsonapi-resources/models/resource';
import { attr, hasOne, hasMany } from 'ember-jsonapi-resources/models/resource';

let <%= classifiedModuleName %>Model = Resource.extend({
  type: '<%= resource %>',
  service: Ember.inject.service('<%= resource %>'),

  <%= attrs %>
});

<%= classifiedModuleName %>Model.reopenClass({

  getDefaults() {
    return {
      attributes: {}
    };
  }
});

export default <%= classifiedModuleName %>Model;
