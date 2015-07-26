/**
  @module ember-jsonapi-resources
  @submodule store
**/


import Ember from 'ember';
import { pluralize } from 'ember-inflector';

/**
  Service for a JSON API endpoint a facade to your resource adapter

  @class StoreService
  @requires Ember.Inflector
  @static
*/
export default Ember.Service.extend({

  /**
    Find resource(s) using an id or a using a query `{id: '', query: {}}`

    @method find
    @param {String} type - the entity or resource name will be pluralized unless a `{singleton: true}` option is passed
    @param {Object|String} options (object) or id (string)
    @return {Promise}
  */
  find(type, options) {
    const service = this._service(type, options);
    return service.find(options);
  },

  /**
    Access to the cached object

    @method all
    @param {String} type - the entity or resource name will be pluralized
    @return {Ember.Array}
  */
  all(type) {
    const service = this._service(type);
    return (service.cache && service.cache.data) ? service.cache.data : Ember.A([]);
  },

  /**
    Create a new resource, sends a POST request

    @method createResource
    @param {Resource} the resource instance to serialize
    @return {Promise}
  */
  createResource(type, resource) {
    const service = this._service(type);
    return service.createResource(resource);
  },

  /**
    Patch an existing resource

    @method updateResource
    @param {String} type - the entity or resource name will be pluralized
    @param {Resource} the resource instance to serialize the changed attributes
    @return {Promise}
  */
  updateResource(type, resource) {
    const service = this._service(type);
    return service.updateResource(resource);
  },

  /**
    Patch a relationship, either add or remove, sends a PATCH request

    Adds with payload: `{ "data": { "type": "comments", "id": "12" } }`
    Removes with payload: `{ "data": null }`

    @method patchRelationship
    @param {String} type - the entity or resource name will be pluralized
    @param {Resource} the resource instance, has URLs via it's relationships property
    @param {String} resource name (plural) to find the url from the resource instance
    @return {Promise}
  */
  patchRelationship(type, resource, relationship) {
    const service = this._service(type);
    return service.patchRelationship(resource, relationship);
  },

  /**
    Delete an existing resource, sends a DELETE request

    @method deleteResource
    @param {String} type - the entity or resource name will be pluralized
    @param {String|Resource} the name (plural) or resource instance w/ self link
    @return {Promise}
  */
  deleteResource(type, resource) {
    const service = this._service(type);
    return service.deleteResource(resource);
  },

  /**
    Lookup the injected service for a resource, pluralize type arg.

    @private
    @method cacheResource
    @param {String} type - the entity or resource name will be pluralized unless a `{singleton: true}` option is passed
    @param {Object} options (object)
  */
  _service(type, options = {}) {
    if (!options.singleton) {
      type = pluralize(type);
    }
    if (!this[type]) {
      throw new Error(type + ' service not initialized');
    }
    return this[type];
  }
});
