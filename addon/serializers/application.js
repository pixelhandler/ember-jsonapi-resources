/**
  @module ember-jsonapi-resources
  @submodule serializer
**/

import Ember from 'ember';
import { pluralize } from 'ember-inflector';

/**
  Serializer/Deserializer for a JSON API resource object, used by adapter

  @class ApplicationSerializer
  @static
*/
export default Ember.Object.extend({

  /**
    Serialize resource for the request payload

    @method serialize
    @param {Resource|Array} resource - object to serialize
    @return {Object} json
  */
  serialize(resources) {
    const json = { data: null };
    json.data = this.serializeResource(resources);
    return json;
  },

  /**
    Serialize a resource object

    @method serializeResource
    @param {Resource} object to serialize
    @return {Object}
  */
  serializeResource(resource) {
    const json = resource.getProperties('type', 'attributes', 'relationships');
    for (let relationship in json.relationships) {
      if (json.relationships.hasOwnProperty(relationship)) {
        delete json.relationships[relationship].links;
        if (!json.relationships[relationship].data) {
          delete json.relationships[relationship];
        }
      }
    }
    return json;
  },

  /**
    Serialize a resource object, but only the changed attributes

    @method serializeChanged
    @param {Resource} object to serialize
    @return {Object}
  */
  serializeChanged(resource) {
    let json = resource.getProperties('id', 'type', 'changedAttributes');
    if (Ember.isEmpty(Object.keys(json.changedAttributes))) { return null; }
    return {
      data: {
        type: json.type,
        id: json.id,
        attributes: json.changedAttributes
      }
    };
  },

  /**
    Deserialize response objects from the request payload

    @method deserialize
    @param {Object} json - response object, extract resource(s)
    @return {Ember.Array|Resource}
  */
  deserialize(json) {
    if (Array.isArray(json.data)) {
      return this.deserializeResources(Ember.A(json.data));
    } else if (typeof json.data === 'object') {
      return this.deserializeResource(json.data);
    } else {
      return null;
    }
  },

  /**
    Deserialize response objects in the payload data

    @method deserializeResources
    @param {Array} collection
    @return {Object|Ember.Array}
  */
  deserializeResources(collection) {
    for (let i = 0; i < collection.length; i++) {
      collection[i] = this.deserializeResource(collection[i]);
    }
    return collection;
  },

  /**
    Deserialize response an object in the payload data

    @method deserializeResource
    @param {Object} json
    @return {Resource}
  */
  deserializeResource(json) {
    return this._createResourceInstance(json);
  },

  /**
    Deserialize optional included array of payload and add to service cache

    @method deserializeIncluded
    @param {Array} related
    @param {Object} resp (optional) e.g. headers, meta, etc.
  */
  deserializeIncluded(related, resp) {
    if (!related) { return; }
    let resource, service;
    for (let i = 0; i < related.length; i++) {
      service = this.container.lookup('service:' + pluralize(related[i].type));
      if (service && service.cache && service.cache.data) {
        resource = service.serializer.deserializeResource(related[i]);
        service.cacheResource({ meta: resp.meta, data: resource, headers: resp.headers});
      }
    }
  },

  /**
    Create a Resource from a JSON API Resource Object

    See <http://jsonapi.org/format/#document-resource-objects>

    @private
    @method _createResourceInstance
    @param {Object} json
    @return (Resource) instance
  */
  _createResourceInstance(json) {
    let resource = {
      'type': json.type,
      'id': json.id,
      'attributes': json.attributes,
      'relationships': json.relationships,
      'links': json.links,
      'meta': json.meta
    };
    for (let prop in resource) {
      if (!resource[prop]) {
        delete resource[prop];
      }
    }
    let factoryName = 'model:' + json.type;
    return this.container.lookupFactory(factoryName).create(resource);
  }
});
