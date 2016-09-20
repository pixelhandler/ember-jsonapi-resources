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
import ResourceOperationsMixin from '../mixins/resource-operations';

const { getOwner, computed, Logger } = Ember;

/**
  A Resource class to create JSON API resource objects. This is abstract, first
  define a prototype using `Resource.extend({ type: entity })`. Model prototypes
  are registered in the container as factories, they use the options:
  `{ instantiate: false, singleton: false }`. So, to create a model instance
  use the owner API or the container to `lookup` the factory, for example:

  ```js
  let owner = (typeof Ember.getOwner === 'function') ? Ember.getOwner(this) : this.container;
  let model = owner.lookup('model:entity').create({ attributes: { key: value } });
  ```

  See <http://jsonapi.org/format/#document-resource-objects>

  @class Resource
  @requires Ember.Inflector
  @static
*/
const Resource = Ember.Object.extend(ResourceOperationsMixin, {
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
    Hash of relationships that were changed

    @private
    @property _relationships
    @type Object
  */
  _relationships: null,

  /**
    Flag for new instance, e.g. not persisted

    @property isNew
    @type Boolean
  */
  isNew: false,

  /**
    Custom `toString` method used for clarity that the instance is a JSON API Resource kind of object

    @method toString
  */
  toString() {
    let type = singularize(this.get('type')) || 'null';
    let id = this.get('id') || 'null';
    return `[JSONAPIResource|${type}:${id}]`;
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
    Adds related resource identifier object to the relationship data.

    Also sets or adds to the `content` of the related proxy object.

    - For has-many relations the related identifier object is added to
      the resource linkage data array.
    - For has-one relations the resource identifier object is assigned,
      so the relation may be replaced.

    See:
    - http://jsonapi.org/format/#document-resource-object-linkage
    - http://jsonapi.org/format/#document-resource-identifier-objects

    @method addRelationship
    @param {String} related - resource name
    @param {String} id
  */
  addRelationship(related, id) {
    if (id !== undefined) { id = id.toString(); } // ensure String id.

    // actual resource type of this relationship is found in related-proxy's meta.
    let meta = this.relationMetadata(related);
    let key = ['relationships', meta.relation, 'data'].join('.');
    let data = this.get(key);
    let type = pluralize(meta.type);
    let identifier = { type: type, id: id };
    let owner = (typeof getOwner === 'function') ? getOwner(this) : this.container;
    let resource = owner.lookup(`service:${type}`).cacheLookup(id);
    if (Array.isArray(data)) {
      this._relationAdded(related, identifier);
      data.push(identifier);
      if (resource) {
        let resources = this.get(related);
        if (!resources.contains(resource)) {
          resources.pushObject(resource);
        }
      }
    } else {
      let previous = (data && data.id) ? { type: type, id: data.id } : null;
      this._relationAdded(related, identifier, previous);
      data = identifier;
      if (resource) {
        this.set(`${meta.relation}.content`, resource);
      }
    }
    return this.set(key, data);
  },

  /**
    Track additions of relationships using a resource identifier objects:

    ```js
    { relation {String}, type {String}, kind {String} }`
    ```

    @private
    @method _relationAdded
    @param {String} relation name of a related resource
    @param {Object} identifier, a resource identifier object `{type: String, id: String}`
    @param {Object|Array} previous, resource identifier object or array of identifiers
  */
  _relationAdded(relation, identifier, previous) {
    let meta = this.relationMetadata(relation);
    setupRelationshipTracking.call(this, relation, meta.kind);
    let ref = this._relationships[relation];
    if (meta && meta.kind === 'hasOne') {
      ref.changed = identifier;
      ref.previous = ref.previous || previous;
    } else if (meta && meta.kind === 'hasMany') {
      let id = identifier.id;
      ref.removals = Ember.A(ref.removals.rejectBy('id', id));
      if (!ref.added.findBy('id', id)) {
        ref.added.push({type: pluralize(relation), id: id});
      }
    }
  },

  /**
    Removes resource identifier object of the relationship data. Also, sets the
    `content` of the related (computed property's) proxy object to `null`.

    - For has-one relations the (resource linkage) data is set to `null`.
    - For has-many relations the resource identifier object is removed from
      the resource Linkage `data` array.

    See:
    - http://jsonapi.org/format/#document-resource-object-linkage
    - http://jsonapi.org/format/#document-resource-identifier-objects

    @method removeRelationship
    @param {String} related - resource name
    @param {String} id
  */
  removeRelationship(related, id) {
    if (id !== undefined) { id = id.toString(); } // ensure String ids.
    let relation = this.get('relationships.' + related);
    if (Array.isArray(relation.data)) {
      for (let i = 0; i < relation.data.length; i++) {
        if (relation.data[i].id === id) {
          relation.data.splice(i, 1);
          this._relationRemoved(related, id);
          break;
        }
      }
      let resources = this.get(related);
      let idx = resources.mapBy('id').indexOf(id);
      if (idx > -1) {
        resources.removeAt(idx);
      }
    } else if (typeof relation === 'object') {
      if (relation.data[related]) {
        this._relationRemoved(related, id);
      }
      relation.data = null;
      this.set(`${related}.content`, null);
    }
  },

  /**
    Track removals of relationships

    @private
    @method _relationRemoved
    @param {String} relation - resource name
    @param {String} id
  */
  _relationRemoved(relation, id) {
    let ref = this._relationships[relation] = this._relationships[relation] || {};
    let meta = this.relationMetadata(relation);
    setupRelationshipTracking.call(this, relation, meta.kind);
    if (meta.kind === 'hasOne') {
      ref.changed = null;
      ref.previous = ref.previous || this.get('relationships.' + relation);
    } else if (meta.kind === 'hasMany') {
      ref.added = Ember.A(ref.added.rejectBy('id', id));
      if (!ref.removals.findBy('id', id)) {
        ref.removals.push({ type: pluralize(relation), id: id });
      }
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
    @method previousAttributes
    @return {Object} the previous attributes
  */
  changedRelationships: computed('_relationships', {
    get() {
      let relationships = Object.keys(this._relationships).filter( (relation) => {
        let ref = this._relationships[relation];
        return !!ref.previous || (ref.removals && ref.removals.length) ||
          (ref.added && ref.added.length);
      });
      return relationships;
    }
  }).volatile(),

  /**
    Rollback changes to attributes and relationships

    @method rollback
  */
  rollback() {
    this.rollbackAttributes();
    this.rollbackRelationships();
  },

  /**
    Revert to previous attributes

    @method rollbackAttributes
  */
  rollbackAttributes() {
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
    Revert to previous relationships

    @method rollbackRelationships
  */
  rollbackRelationships() {
    let relations = this.get('changedRelationships');
    if (relations && relations.length > 0) {
      relations.forEach((relation) => {
        let ref = this._relationships[relation];
        let meta = this.relationMetadata(relation);
        if (meta && meta.kind === 'hasOne') {
          if (ref.changed && ref.changed.id && ref.previous && ref.previous.id) {
            this.addRelationship(relation, ref.previous.id);
          }
        } else if (meta && meta.kind === 'hasMany') {
          let added = ref.added.mapBy('id');
          let removed = ref.removals.mapBy('id');
          added.forEach( (id) => {
            this.removeRelationship(relation, id);
          });
          removed.forEach( (id) => {
            this.addRelationship(relation, id);
          });
        }
      });
    }
    this._resetRelationships();
  },

  /**
    Reset tracked relationship changes

    @private
    @method _resetRelationships
  */
  _resetRelationships() {
    for (let attr in this._relationships) {
      if (this._relationships.hasOwnProperty(attr)) {
        delete this._relationships[attr];
      }
    }
  },

  /**
    @method relationMetadata
    @param {String} property name of a related resource
    @return {Object|undefined} `{ relation {String}, type {String}, kind {String} }`
  */
  relationMetadata(property) {
    let meta;
    try {
      meta = this.constructor.metaForProperty(property);
    } catch (e) {
      meta = this.get('content').constructor.metaForProperty(property);
    }
    return meta;
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
    @static
    @return {Resource} instance with protected objects:
      `attributes`, `links` and `relationships`
  */
  create(properties) {
    properties = properties || {};
    const prototype = {};
    const attrs = Ember.String.w('_attributes attributes links meta relationships _relationships');
    for (let i = 0; i < attrs.length; i++) {
      prototype[attrs[i]] = {};
    }

    // JSONAPI ids MUST be strings.
    // Without an id we default isNew to true (unless otherwise specified)
    if (properties.hasOwnProperty('id')) {
      properties.id = properties.id.toString();
    } else if (typeof properties.isNew === 'undefined') {
      properties.isNew = true;
    }

    const instance = this._super(prototype);
    instance.setProperties(properties);

    let type = singularize(instance.get('type'));
    let msg = (type) ? Ember.String.capitalize(type) : 'Resource';
    let factory = 'model:' + type;
    if (!type) {
      Logger.warn(msg + '#create called, instead you should first use ' + msg + '.extend({type:"entity"})');
    } else {
      let owner = (typeof getOwner === 'function') ? getOwner(instance) : instance.container;
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
        setupRelationship.call(instance, meta.relation, meta.kind);
        setupRelationshipTracking.call(instance, meta.relation, meta.kind);
      }
    } catch (e) {
      return; // metaForProperty has an assertion that may throw
    }
  });
}

function setupRelationship(relation, kind) {
  let ref = this.relationships[relation];
  if (!ref) {
    ref = this.relationships[relation] = { links: {}, data: null };
  }
  if (!ref.links) {
    ref.links = {};
  }
  if (!ref.data) {
    if (kind === 'hasOne') {
      ref.data = null;
    } else if (kind === 'hasMany') {
      ref.data = Ember.A([]);
    }
  }
}

function setupRelationshipTracking(relation, kind) {
  this._relationships[relation] = this._relationships[relation] || {};
  let ref = this._relationships[relation];
  if (kind === 'hasOne') {
    ref.changed = ref.changed || null;
    ref.previous = ref.previous || null;
  } else if (kind === 'hasMany') {
    ref.added = ref.added || Ember.A([]);
    ref.removals = ref.removals || Ember.A([]);
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
