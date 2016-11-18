/**
  @module ember-jsonapi-resources
  @submodule resource-operations
**/
import Ember from 'ember';

/**
  Mixin to provide interations between a Resource instance and service/adapter.

  @class ResourceOperationsMixin
  @static
*/
export default Ember.Mixin.create({
  /**
    The service object for the entity (adapter with cache and serializer)

    @property service
    @type Object
    @required
  */
  service: Ember.required,

  /**
    Create a new resource, calls service to persist new model

    - See: <http://jsonapi.org/format/#crud-creating>

    Calling `this.createResource` will call the service to persist the new model,
    via it's `createResource` method.

    @method createResource
    @return {Promise}
  */
  createResource() {
    return this.get('service').createResource(this);
  },

  /**
    Update a persistend resource, calls service to persist changes

    - See: <http://jsonapi.org/format/#crud-updating>

    Calling `this.updateResource` will call the service to persist the changes,
    via it's `updateResource` method.

    @method updateResource
    @return {Promise}
  */
  updateResource() {
    return this.get('service').updateResource(this);
  },

  /**
    Delete a persistend resource, calls service to DELETE via API request

    - See: <http://jsonapi.org/format/#crud-deleting>

    Calling `this.deleteResource` will call the service to remove the destroy,
    via it's `deleteResource` method.

    @method deleteResource
    @return {Promise}
  */
  deleteResource() {
    return this.get('service').deleteResource(this);
  },

  /**
    Create a relationship for a `to-many` relation, calls service to persist.

    See: <http://jsonapi.org/format/#crud-updating-to-many-relationships>

    Calling `this.createRelationship` will call the service to persist the changes,
    via it's `createRelationship` method. Since the default `catch` for this
    method is to rollback the relationships, an optional `errorCallback` function
    can be used to handle the error response.

    @method createRelationship
    @param {String} relationship name (plural) to find the url
    @param {String} id of the related resource
    @param {Function} errorCallback `function (error) {}`
    @return {Promise}
  */
  createRelationship(relationship, id, errorCallback) {
    this.addRelationship(relationship, id);
    return this.get('service').createRelationship(this, relationship, id)
    .catch(function (error) {
      this.removeRelationship(relationship, id);
      if (typeof errorCallback === 'function') {
        errorCallback(error);
      } else {
        Ember.Logger.error(error);
      }
    }.bind(this));
  },

  /**
    Update a relationship, works with both `to-many` and `to-one`. Primarily use
    with `to-one` as `to-many` is for a full replacement only.

    For a `to-one` relationship, add, replace or remove, and persist the change
    using the service. With an id the relation will be added or changed, with
    `null` a relationship will be removed.

    See: <http://jsonapi.org/format/#crud-updating-resource-relationships>

    For `to-many` relationships the backend will need to support editing as a set,
    full replacement (most often that may be disabled).

    Update a relationship by adding or removing using a list, id, or null. When
    adding an id for a to-many relationship send one or more ids, include the
    existing ids as well. When removing from a to-many relationship pass the ids
    that should remain, missing ids will be removed, or remove all with an empty
    array.

    Calling `this.updateRelationship` will call the service to persist the changes,
    via it's `patchRelationship` method. Since the default `catch` for this
    method is to rollback the relationships, an optional `errorCallback` function
    can be used to handle the error response.

    @method updateRelationship
    @param {String} relationship name
    @param {Array|String|null} ids can be only one id or null to remove
    @param {Function} errorCallback `function (error) {}`
    @return {Promise}
  */
  updateRelationship(relationship, ids, errorCallback) {
    let related = this.get(relationship);
    let rollback;
    if (related.kind === 'toOne') {
      rollback = related.get('id');
    } else if (related.kind === 'toMany') {
      rollback = related.mapBy('id');
    }
    this._updateRelationshipsData(relationship, ids);
    return this.get('service').patchRelationship(this, relationship)
    .catch(function (error) {
      this._updateRelationshipsData(relationship, rollback);
      if (typeof errorCallback === 'function') {
        errorCallback(error);
      } else {
        Ember.Logger.error(error);
      }
    }.bind(this));
  },

  /**
    Deletes a relationship for `to-many` relation, calls service to persist.

    See: <http://jsonapi.org/format/#crud-updating-to-many-relationships>

    Calling `this.deleteRelationship` will call the service to persist the changes,
    via it's `deleteRelationship` method. Since the default `catch` for this
    method is to rollback the relationships, an optional `errorCallback` function
    can be used to handle the error response.

    @method deleteRelationship
    @param {String} relationship name (plural) to find the url
    @param {String} id of the related resource
    @param {Function} errorCallback `function (error) {}`
    @return {Promise}
  */
  deleteRelationship(relationship, id, errorCallback) {
    this.removeRelationship(relationship, id);
    return this.get('service').deleteRelationship(this, relationship, id)
    .catch(function (error) {
      this.addRelationship(relationship, id);
      if (typeof errorCallback === 'function') {
        errorCallback(error);
      } else {
        Ember.Logger.error(error);
      }
    }.bind(this));
  },

  _updateRelationshipsData: Ember.required
});
