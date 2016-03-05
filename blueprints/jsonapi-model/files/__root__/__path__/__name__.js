import Ember from 'ember';
import Resource from 'ember-jsonapi-resources/models/resource';
import { attr, hasOne, hasMany } from 'ember-jsonapi-resources/models/resource';

let <%= classifiedModuleName %> = Resource.extend({
  type: '<%= resource %>',
  service: Ember.inject.service('<%= resource %>'),

  <%= attrs %>
});

<%= classifiedModuleName %>.reopenClass({

  getDefaults() {
    return {
      isNew: true,
      attributes: {}
    };
  }
});

export default <%= classifiedModuleName %>;
