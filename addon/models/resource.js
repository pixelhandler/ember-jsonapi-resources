import Ember from 'ember';
import { pluralize } from 'ember-inflector';

/*
  A Resource class to create JSON API resource objects

  See <http://jsonapi.org/format/#document-resource-objects>

  @class Resource
  @requires Ember.Inflector
  @static
*/
const Resource = Ember.Object.extend({

  /*
    The service object for the entity (adapter with cache and serializer)

    @property service
    @required
  */
  service: null,

  /*
    Extending Prototypes Must define a `type` value for the entity, e.g. `posts`

    @property type
    @required
  */
  type: null,

  /*
    Persisted resource ID value

    @property id
    @required
  */
  id: null,

  /*
    An optional property of for a JSON API Resource object, setup in create()

    This object will keep the values from the response object and may be mutable
    Use this as a refence for creating computed properties

    For example the `attr()` helper sets up a properties based on this content

    @protected
    @property attributes
  */
  attributes: null,

  /*
    An optional property of for a JSON API Resource object, setup in create()

    @protected
    @property relationships
  */
  relationships: null,

  /*
    An optional property of for a JSON API Resource object, setup in create()

    @protected
    @property attributes
  */
  links: null,

  /*
    An optional property of for a JSON API Resource object, setup in create()

    @protected
    @property meta
  */
  meta: null,

  /*
    Hash of attributes for changed/previous values

    @private
    @property _attributes
  */
  _attributes: null,

  /*
    Flag for new instance, e.g. not peristed

    @property isNew
  */
  isNew: false,

  /*
    Custom `toString` method used for clarity that the instance is a JSON API Resource kind of object

    @method toString
  */
  toString() {
    return Ember.String.fmt("[JSONAPIResource|%@:%@]", this.get('type'), this.get('id'));
  },

  /*
    Adds related links object on the relationship hash

    @method addRelationship
  */
  addRelationship(related, id) {
    setupRelationship.call(this, related);
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

  /*
    Set related links object on the relationship hash to have `null` data

    @method removeRelationship
  */
  removeRelationship(related) {
    const key = ['relationships', related, 'data'].join('.');
    return this.set(key, { data: null });
  },

  /*
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

  /*
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

  /*
    Initialize events to communicate with the service object, listen for `didUpdateResource`

    @method initEvents
  */
  initEvents: Ember.on('init', function () {
    const service = this.get('service');
    if (service) {
      service.on('didUpdateResource', this, this.didUpdateResource);
    }
  }),

  /*
    Handler for `didUpdateResource` event, resets private _attributes used for changed/previous tracking

    @method didUpdateResource
  */
  didUpdateResource() {
    for (let attr in this._attributes) {
      if (this._attributes.hasOwnProperty(attr)) {
        delete this._attributes[attr];
      }
    }
  }
});

Resource.reopenClass({
  /*
    To protect the JSON API Resource properties for attributes, links and relationships
    these objects are setup during create(). This has to be defined since the attr()
    helper needs to have new objects for each instance, to project from keeping a
    reference on the prototype.

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
    return instance;
  }
});

export default Resource;

/*
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

/*
  Mixin for creating promise proxy objects for related resources

  @class RelatedProxyUtil
  @static
*/
const RelatedProxyUtil = Ember.Object.extend({
  init: function () {
    this._super();
    if (typeof this.get('resource') !== 'string') {
      throw new Error('RelatedProxyUtil#init expects `resource` property to exist.');
    }
    return this;
  },

  _proxy: null,

  createProxy: function (model, proxyFactory) {
    const resource = this.get('resource');
    const url = this._proxyUrl(model, resource);
    const service = model.container.lookup('service:' + pluralize(resource));
    const proxy = proxyFactory.extend(Ember.PromiseProxyMixin, {
      promise: service.findRelated(resource, url),
      type: resource
    });
    this._proxy = proxy.create();
    this._proxy.then(
      function (resources) {
        this._proxy.set('content', resources);
      }.bind(this),
      function (error) {
        console.error(error);
        throw error;
      }
    );
  },

  _proxyUrl(model, resource) {
    const related = linksPath(resource);
    const url = model.get(related);
    if (typeof url !== 'string') {
      throw new Error('RelatedProxyUtil#_proxyUrl expects `model.'+ related +'` property to exist.');
    }
    return url;
  }
});

function linksPath(resourceName) {
  return ['relationships', resourceName, 'links', 'related'].join('.');
}

/*
  Helper to setup a has one relationship to another resource

  @method hasOne
*/
export function hasOne(resource) {
  const util = RelatedProxyUtil.create({'resource': resource});
  const path = linksPath(resource);
  return Ember.computed(path, function () {
    setupRelationship.call(this, resource);
    util.createProxy(this, Ember.ObjectProxy);
    return util._proxy;
  });
}

/*
  Helper to setup a has many relationship to another resource

  @method hasMany
*/
export function hasMany(resource) {
  const util = RelatedProxyUtil.create({'resource': resource});
  return Ember.computed(linksPath(resource), function () {
    setupRelationship.call(this, resource);
    util.createProxy(this, Ember.ArrayProxy);
    return util._proxy;
  });
}

function setupRelationship(resource) {
  if (!this.relationships[resource]) {
    this.relationships[resource] = { links: {}, data: null };
  }
  if (!this.relationships[resource].links) {
    this.relationships[resource].links = {};
  }
  if (!this.relationships[resource].data) {
    this.relationships[resource].data = null;
  }
}
