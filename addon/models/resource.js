/**
  @module ember-jsonapi-resources
  @submodule resource
**/

import Ember from 'ember';
import { pluralize, singularize } from 'ember-inflector';
import attr from 'ember-jsonapi-resources/utils/attr';
import hasOne from 'ember-jsonapi-resources/utils/has-one';
import hasMany from 'ember-jsonapi-resources/utils/has-many';
import { isType } from 'ember-jsonapi-resources/utils/is';

const { computed, Logger } = Ember;

/**
  A Resource class to create JSON API resource objects

  See <http://jsonapi.org/format/#document-resource-objects>

  @class Resource
  @requires Ember.Inflector
  @static
*/
const Resource = Ember.Object.extend({

  /**
    The service object for the entity (adapter with cache and serializer)

    @property service
    @type Object
    @required
  */
  service: null,

  /**
    Extending Prototypes Must define a `type` value for the entity, e.g. `posts`

    @property type
    @type String
    @required
  */
  type: null,

  /**
    Persisted resource ID value

    @property id
    @type String
    @required
  */
  id: null,

  /**
    An optional `attributes` property of for a JSON API Resource object, setup in create()

    This object will keep the values from the response object and may be mutable
    Use this as a refence for creating computed properties

    For example the `attr()` helper sets up a properties based on this content

    @protected
    @property attributes
    @type Object
  */
  attributes: null,

  /**
    An optional `relationships` property of for a JSON API Resource object, setup in create()

    @protected
    @property relationships
    @type Object
  */
  relationships: null,

  /**
    An optional `links` property of for a JSON API Resource object, setup in create()

    @protected
    @property links
    @type Object
  */
  links: null,

  /**
    An optional property of for a JSON API Resource object, setup in create()

    @protected
    @property meta
    @type Object
  */
  meta: null,

  /**
    Hash of attributes for changed/previous values

    @private
    @property _attributes
    @type Object
  */
  _attributes: null,

  /**
    Flag for new instance, e.g. not peristed

    @property isNew
    @type Boolean
  */
  isNew: false,

  /**
    Custom `toString` method used for clarity that the instance is a JSON API Resource kind of object

    @method toString
  */
  toString() {
    let type = this.get('type') || 'null';
    let id = this.get('id') || 'null';
    return `[JSONAPIResource|${type}:${id}]`;
  },

  /**
    Update a relation by adding or removing using a list, id, or null. When
    adding an id for a to-many relation send one or more ids, include the
    existing ids as well. When removing from a to-many relation pass the ids
    that should remain, missing ids will be removed, or remove all with an empty
    array. When operating on a to-one relation just use the id to change the
    relation, or null to remove.

    This is not a replace operation, but rather support for editing as a set.

    @method updateRelationship
    @param {String} relation
    @param {Array|String|null} ids
  */
  updateRelationship(relation, ids) {
    this._updateRelationshipsData(relation, ids);
    return this.get('service').patchRelationship(this, relation);
  },

  /**
    @private
    @method _updateRelationshipsData
    @param {String} relation
    @param {Array|String|null} ids
  */
  _updateRelationshipsData(relation, ids) {
    let relationshipData = 'relationships.' + relation + '.data';
    let existing;
    if (!Array.isArray(ids)) {
      existing = this.get(relationshipData).id;
      this.removeRelationship(relation, existing);
      if (isType('string', ids)) {
        this.addRelationship(relation, ids);
      }
    } else {
      existing = this.get(relationshipData).map(function(rel) { return rel.id; });
      if (!existing.length) {
        this.addRelationships(relation, ids);
      } else if (ids.length > existing.length) {
        this.addRelationships(relation, unique(ids, existing));
      } else if (existing.length > ids.length) {
        this.removeRelationships(relation, unique(existing, ids));
      }
    }
  },

  /**
    @method addRelationships
    @param {String} related - resource name
    @param {Array} ids
  */
  addRelationships(related, ids) {
    for (let i = 0; i < ids.length; i++) {
      this.addRelationship(related, ids[i]);
    }
  },

  /**
    @method removeRelationships
    @param {String} related - resource name
    @param {Array} ids
  */
  removeRelationships(related, ids) {
    for (let i = 0; i < ids.length; i++) {
      this.removeRelationship(related, ids[i]);
    }
  },

  /**
    Adds related links object on the relationship hash

    @method addRelationship
    @param {String} related - resource name
    @param {String} id
  */
  addRelationship(related, id) {
    const key = ['relationships', related, 'data'].join('.');
    let data = this.get(key);
    const type = pluralize(related);
    const linkage = { type: type, id: id };
    if (Array.isArray(data)) {
      data.push(linkage);
    } else {
      data = linkage;
    }
    return this.set(key, data);
  },

  /**
    Remove related links object on the relationship hash to have `null` data

    @method removeRelationship
    @param {String} related - resource name
    @param {String} id
  */
  removeRelationship(related, id) {
    let relation = this.get('relationships.' + related);
    if (Array.isArray(relation.data)) {
      for (let i = 0; i < relation.data.length; i++) {
        if (relation.data[i].id === id) {
          relation.data.splice(i, 1);
          break;
        }
      }
    } else if (typeof relation === 'object') {
      relation.data = null;
    }
  },

  /**
    @method changedAttributes
    @return {Object} the changed attributes
  */
  changedAttributes: computed('attributes', {
    get: function () {
      const attrs = {};
      for (let key in this._attributes) {
        if (this._attributes.hasOwnProperty(key)) {
          if (this._attributes[key].changed !== this._attributes[key].previous) {
            attrs[key] = this._attributes[key].changed;
          }
        }
      }
      return attrs;
    }
  }).volatile(),

  /**
    @method previousAttributes
    @return {Object} the previous attributes
  */
  previousAttributes: computed('attributes', {
    get: function () {
      const attrs = {};
      for (let key in this._attributes) {
        if (this._attributes.hasOwnProperty(key)) {
          if (this._attributes[key].changed !== this._attributes[key].previous) {
            attrs[key] = this._attributes[key].previous;
          }
        }
      }
      return attrs;
    }
  }).volatile(),

  /**
    Revert to previous attributes

    @method rollback
  */
  rollback() {
    let attrs = this.get('previousAttributes');
    for (let prop in attrs) {
      if (attrs.hasOwnProperty(prop)) {
        this.set(`attributes.${prop}`, attrs[prop]);
        this.notifyPropertyChange(prop);
      }
    }
    this._resetAttributes();
  },

  /**
    Reset tracked changed/previous attrs

    @private
    @method _resetAttributes
  */
  _resetAttributes() {
    for (let attr in this._attributes) {
      if (this._attributes.hasOwnProperty(attr)) {
        delete this._attributes[attr];
      }
    }
  },

  /**
    Sets all payload properties on the resource and resets private _attributes
    used for changed/previous tracking

    @method didUpdateResource
    @param {Object} json the updated data for the resource
  */
  didUpdateResource(json) {
    if (this.get('id') !== json.id) { return; }
    this.setProperties(json);
    this._resetAttributes();
  },

  /**
    Sets the relationships data, used after the promise proxy resolves by
    hasOne and hasMany helpers

    @method didResolveProxyRelation
    @param {String} relation name
    @param {String} kind of relation hasOne or hasMany
    @param {Array|Object} related resource(s)
  */
  didResolveProxyRelation(relation, kind, related) {
    let ids;
    if (Array.isArray(related)) {
      ids = related.mapBy('id');
    } else if (related) {
      ids = related.get('id');
    } else {
      return;
    }
    let relationshipData = 'relationships.' + relation + '.data';
    let data = this.get(relationshipData);
    if (!data) {
      if (kind === 'hasOne') {
        this.set(relationshipData, {});
      } else if (kind === 'hasMany') {
        this.set(relationshipData, Ember.A([]));
      }
    }
    this._updateRelationshipsData(relation, ids);
  },

  /**
    A local cache duration, to minimize duplicate fetch requests

    @property cacheDuration
    @type Number
  */
  cacheDuration: /* minutes */ 7 * /* seconds */ 60 * /* milliseconds */ 1000,

  /**
    @property isCacheExpired
    @type Boolean
  */
  isCacheExpired: computed('meta.timeStamps.local', 'cacheDuration', function () {
    const localTime = this.get('meta.timeStamps.local');
    const expiresTime = localTime + this.get('cacheDuration');
    return (localTime) ? Date.now() >= expiresTime : false;
  })
});

Resource.reopenClass({
  /**
    To protect the JSON API Resource properties for attributes, links and
    relationships these objects are setup during create(). This has to be
    defined since the attr() helper needs to have new objects for each instance,
    to project from keeping a reference on the prototype.

    The create method should only be called after looking up a factory from the
    container, for example in a route's model hook:

    ```
    model() {
      let owner = (typeof Ember.getOwner === 'function') ? Ember.getOwner(this) : this.container;
      return owner.lookup('model:post').create({
        attributes: {
          title: 'The JSON API 1.0 Spec Rocks!'
        }
      });
    }
    ```

    The create method uses the container to lookup the factory's prototype and
    find the computed properties used for relations to setup the relationships
    for the Resource instance you create. Calling Resource#create without using
    the factory lookup will result in an instance without a reference to the
    application's container and you will have to manually setup the relationships
    object prior to adding a relationship.

    @method create
    @return {Resource} instance with protected objects:
      `attributes`, `links` and `relationships`
  */
  create(properties) {
    const prototype = {};
    const attrs = Ember.String.w('_attributes attributes links meta relationships');
    for (let i = 0; i < attrs.length; i++) {
      prototype[attrs[i]] = {};
    }
    const instance = this._super(prototype);
    if (properties) {
      instance.setProperties(properties);
    }
    let type = singularize(instance.get('type'));
    let msg = (type) ? Ember.String.capitalize(type) : 'Resource';
    let factory = 'model:' + type;
    if (!type) {
      Logger.warn(msg + '#create called, instead you should first use ' + msg + '.extend({type:"entity"})');
    } else {
      let owner = (typeof Ember.getOwner === 'function') ? Ember.getOwner(instance) : instance.container;
      if (owner) {
        useComputedPropsMetaToSetupRelationships(owner, factory, instance);
      } else {
        msg += '#create should only be called from a container lookup (relationships not setup), instead use: \n';
        msg += "`let owner = (typeof Ember.getOwner === 'function') ? Ember.getOwner(this) : this.container; \n";
        msg += 'owner.lookup("' + factory + '").create()`';
        Logger.warn(msg);
      }
    }
    return instance;
  }
});

export default Resource;

export { attr, hasOne, hasMany };

let _rp = 'service type id attributes relationships links meta _attributes isNew cacheDuration isCacheExpired';
const ignoredMetaProps = _rp.split(' ');

function useComputedPropsMetaToSetupRelationships(owner, factory, instance) {
  factory = owner.lookup(factory);
  factory.eachComputedProperty(function(prop) {
    if (ignoredMetaProps.indexOf(prop) > -1) { return; }
    try {
      let meta = factory.metaForProperty(prop);
      if (meta && meta.kind) {
        if (meta.kind === 'hasOne') {
          setupRelationship.call(instance, prop);
        } else if (meta.kind === 'hasMany') {
          setupRelationship.call(instance, prop, Ember.A([]));
        }
      }
    } catch (e) {
      return; // metaForProperty has an assertion that may throw
    }
  });
}

function setupRelationship(relation, data = null) {
  if (!this.relationships[relation]) {
    this.relationships[relation] = { links: {}, data: data };
  }
  if (!this.relationships[relation].links) {
    this.relationships[relation].links = {};
  }
  if (!this.relationships[relation].data) {
    this.relationships[relation].data = data;
  }
}

function unique(superSet, subSet) {
  let intersection = superSet.filter(function (item) {
    return subSet.indexOf(item) !== -1;
  });
  let _unique = superSet.filter(function (item) {
    return intersection.indexOf(item) === -1;
  });
  return (unique.length) ? _unique : subSet;
}
