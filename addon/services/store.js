import Ember from 'ember';
import { pluralize } from 'ember-inflector';

export default Ember.Service.extend({

  find(type, options) {
    const service = this._service(type);
    return service.find(options);
  },

  all(type) {
    const service = this._service(type);
    return service.cache.data;
  },

  createResource(type, resource) {
    const service = this._service(type);
    return service.createResource(resource);
  },

  updateResource(type, resource) {
    const service = this._service(type);
    return service.updateResource(resource);
  },

  patchRelationship(type, resource, relationship) {
    const service = this._service(type);
    return service.patchRelationship(resource, relationship);
  },

  deleteResource(type, resource) {
    const service = this._service(type);
    return service.deleteResource(resource);
  },

  _service(type) {
    type = pluralize(type);
    if (!this[type]) {
      throw new Error(type + ' service not initialized');
    }
    return this[type];
  }

});
