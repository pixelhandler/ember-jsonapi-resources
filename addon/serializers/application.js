/**
  @module ember-jsonapi-resources
  @submodule serializer
**/

import Ember from 'ember';
import { pluralize } from 'ember-inflector';

/**
  Serializer/Deserializer for a JSON API resource object, used by adapter.

  When extending use a mixin or define transform methods to serialize and/or
  deserializer attributes based on the name or the type of attribute.

  The methods use a naming convention:

    - '[de]serialize' + 'AttrName' or 'TypeName' + 'Attribute'
    - E.g. use `serializeNameAttribute` and `deserializeNameAttribute` in
      a generated serializer for use with `name: attr()`
    - Or, redefine `serializeDateAttribute` and `deserializeDateAttribute`
      to use your own data transformation with `attr('date')` the default,
      Date type [de]serialize methods transfrom to/from ISO Format.
    - Transform methods based on the name of the attribute will be called
      instead of any transform methods based on the type of the attribute.

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
    let json = resource.getProperties('type', 'attributes', 'relationships');
    json = this.transformAttributes(json, 'serialize');
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
    let serialized = {
      data: {
        type: json.type,
        id: json.id,
        attributes: json.changedAttributes
      }
    };
    serialized.data = this.transformAttributes(serialized.data, 'serialize');
    return serialized;
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
    json = this.transformAttributes(json);
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
    Transform attributes, serialize or deserialize by specified method or
    per type of attribute, e.g. date.

    Your serializer may define a specific method for a type of attribute,
    i.e. `serializeDateAttribute` and/or `deserializeDateAttribute`. Likewise,
    your serializer may define a specific method for the name of an attribute,
    like `serializeUpdatedAtAttribute` and `deserializeUpdatedAtAttribute`.

    During transformation a method based on the name of the attribute takes
    priority over a transform method based on the type of attribute, e.g. date.

    @method transformAttributes
    @param {Object} json with attributes hash of resource properties to be transformed
    @param {String} [operation='deserialize'] perform a serialize or deserialize
      operation, the default operation is to deserialize when not passed
    @return {Object} json
  */
  transformAttributes(json, operation = 'deserialize') {
    assertTranformOperation(operation);
    let transformMethod, factory, meta;
    for (let attr in json.attributes) {
      transformMethod = [operation, Ember.String.capitalize(attr), 'Attribute'].join('');
      if (typeof this[transformMethod] === 'function') {
        json.attributes[attr] = this[transformMethod](json.attributes[attr]);
      } else {
        try {
          factory = this._lookupFactory(json.type);
          meta = factory.metaForProperty(attr);
          transformMethod = [operation, Ember.String.capitalize(meta.type), 'Attribute'].join('');
          if (typeof this[transformMethod] === 'function') {
            json.attributes[attr] = this[transformMethod](json.attributes[attr]);
          }
        } catch (e) {
          continue; // metaForProperty has an assertion that may throw
        }
      }
    }
    return json;
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
    return this._lookupFactory(json.type).create(resource);
  },

  /**
    @private
    @method _lookupFactory
    @param {String} type
    @return {Function} factory for creating resource instances
  */
  _lookupFactory(type) {
    return this.container.lookupFactory('model:' + type);
  }
});

const tranformOperations = ['serialize', 'deserialize'];

function assertTranformOperation(operation) {
  Ember.assert(`${operation} is not a valid transform operation`, tranformOperations.indexOf(operation) > -1);
}
