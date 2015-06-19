/**
  @module ember-jsonapi-resources
  @submodule resource
**/

import Ember from 'ember';
import { pluralize, singularize } from 'ember-inflector';

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
    return Ember.String.fmt("[JSONAPIResource|%@:%@]", this.get('type'), this.get('id'));
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
      data.pushObject(linkage);
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
  changedAttributes: Ember.computed('attributes', {
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
  }),

  /**
    @method previousAttributes
    @return {Object} the previous attributes
  */
  previousAttributes: Ember.computed('attributes', {
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
  }),

  /**
    Initialize events to communicate with the service object, listen for `didUpdateResource`

    @method initEvents
  */
  initEvents: Ember.on('init', function () {
    const service = this.get('service');
    if (service) {
      service.on('didUpdateResource', this, this.didUpdateResource);
    }
  }),

  /**
    Handler for `didUpdateResource` event, resets private _attributes used for changed/previous tracking

    @method didUpdateResource
  */
  didUpdateResource() {
    for (let attr in this._attributes) {
      if (this._attributes.hasOwnProperty(attr)) {
        delete this._attributes[attr];
      }
    }
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
  isCacheExpired: Ember.computed('meta.timeStamps.local', 'cacheDuration', function () {
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
      return this.container.lookupFactory('model:posts').create({
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
    @returns {Resource} instance with protected objects:
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
    let type = instance.get('type');
    let msg = (type) ? Ember.String.capitalize(singularize(type)) : 'Resource';
    if (!type) {
      Ember.Logger.warn(msg + '#create called, instead you should first use ' + msg + '.extend({type:"entity"})');
    }
    let factory = 'model:' + type;
    if (instance.container) {
      factory = instance.container.lookupFactory(factory);
      let proto = factory.proto();
      factory.eachComputedProperty(function(prop) {
        if (proto[prop] && proto[prop]._meta && typeof proto[prop]._meta === 'object') {
          if (proto[prop]._meta.kind === 'hasOne') {
            setupRelationship.call(instance, prop);
          } else if (proto[prop]._meta.kind === 'hasMany') {
            setupRelationship.call(instance, prop, Ember.A([]));
          }
        }
      });
    } else {
      msg += '#create should only be called from a container lookup (relationships not setup) ';
      msg += 'use this.container.lookupFactory("' + factory + '").create() instead.';
      Ember.Logger.warn(msg);
    }
    return instance;
  }
});

export default Resource;

/**
  Helper to setup computed property for resource attributes

  @method attr
*/
export function attr(type, mutable = true) {
  const _mutable = mutable;
  return Ember.computed('attributes', {
    get: function (key) {
      return this.get('attributes.' + key);
    },

    set: function (key, value) {
      const lastValue = this.get('attributes.' + key);
      if (!_mutable) { return lastValue; }
      if (value === lastValue) { return value; }
      this.set('attributes.' + key, value);
      if (!this.get('isNew')) {
        this._attributes[key] = this._attributes[key] || {};
        this._attributes[key].changed = value;
        this._attributes[key].previous = lastValue;
        const service = this.get('service');
        if (service) {
          service.trigger('attributeChanged', this);
        }
      }
      return this.get('attributes.' + key);
    }
  });
}

/**
  Mixin for creating promise proxy objects for related resources

  @class RelatedProxyUtil
  @static
*/
const RelatedProxyUtil = Ember.Object.extend({

  /**
    Checks for required `relationship` property

    @method init
  */
  init: function () {
    this._super();
    if (typeof this.get('relationship') !== 'string') {
      throw new Error('RelatedProxyUtil#init expects `relationship` property to exist.');
    }
    return this;
  },

  /**
    The name of the relationship

    @property resource
    @type String
    @required
  */
  relationship: null,

  /**
    Proxy for the requested relation, resolves w/ content from fulfilled promise

    @method createProxy
    @param {Resource} resource
    @param {Ember.ObjectProxy|Ember.ArrayProxy} proxyFactory
    @return {PromiseProxy} proxy
  */
  createProxy: function (resource, proxyFactory) {
    const relation = this.get('relationship');
    const url = this.proxyUrl(resource, relation);
    const service = resource.container.lookup('service:' + pluralize(relation));
    let promise = this.promiseFromCache(resource, relation, service);
    promise = promise || service.findRelated(relation, url);
    let proxy = proxyFactory.extend(Ember.PromiseProxyMixin, {
      'promise': promise, 'type': relation
    });
    proxy = proxy.create();
    proxy.then(
      function (resources) {
        proxy.set('content', resources);
      },
      function (error) {
        console.error(error);
        throw error;
      }
    );
    return proxy;
  },

  /**
    Proxy url to fetch for the resource's relation

    @method proxyUrl
    @param {Resource} resource
    @param {String} relation
    @return {PromiseProxy} proxy
  */
  proxyUrl(resource, relation) {
    const related = linksPath(relation);
    const url = resource.get(related);
    if (typeof url !== 'string') {
      throw new Error('RelatedProxyUtil#_proxyUrl expects `model.'+ related +'` property to exist.');
    }
    return url;
  },

  /**
    Lookup relation from service cache and pomisify result

    @method promiseFromCache
    @param {Resource} resource
    @param {String} relation
    @param {Object} service
    @return {Promise|null}
  */
  promiseFromCache(resource, relation, service) {
    let data = resource.get('relationships.' + relation + '.data');
    if (!data) { return; }
    let content = Ember.A([]), found;
    if (Array.isArray(data)) {
      for (let i = 0; i < data.length; i++) {
        found = this.serviceCacheLookup(service, data[i]);
        if (found) {
          content.push(found);
        }
      }
      content = (data.length && data.length === content.length) ? content : null;
    } else {
      content = this.serviceCacheLookup(service, data);
    }
    return (content) ? Ember.RSVP.Promise.resolve(content) : null;
  },

  /**
    Lookup data in service cache

    @method serviceCacheLookup
    @param {Object} service
    @param {Object} data
    @return {Resource|undefined}
  */
  serviceCacheLookup(service, data) {
    return (typeof data === 'object' && data.id) ? service.cacheLookup(data.id) : undefined;
  }
});

function linksPath(relation) {
  return ['relationships', relation, 'links', 'related'].join('.');
}

/**
  Helper to setup a has one relationship to another resource

  @method hasOne
  @param {String} relation
*/
export function hasOne(relation) {
  const util = RelatedProxyUtil.create({'relationship': relation});
  const path = linksPath(relation);
  return Ember.computed(path, function () {
    return util.createProxy(this, Ember.ObjectProxy);
  }).meta({relation: relation, kind: 'hasOne'});
}

/**
  Helper to setup a has many relationship to another resource

  @method hasMany
  @param {String} relation
*/
export function hasMany(relation) {
  const util = RelatedProxyUtil.create({'relationship': relation});
  const path = linksPath(relation);
  return Ember.computed(path, function () {
    return util.createProxy(this, Ember.ArrayProxy);
  }).meta({relation: relation, kind: 'hasMany'});
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
