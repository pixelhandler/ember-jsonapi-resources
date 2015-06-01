import Ember from 'ember';
import { pluralize } from 'ember-inflector';

const Resource = Ember.Object.extend({
  type: null,
  links: {},
  attributes: {},
  relationships: {},

  toString() {
    return "[%@Resource:%@]".fmt(this.get('type'), this.get('id'));
  },

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

  removeRelationship(related) {
    const key = ['relationships', related, 'data'].join('.');
    return this.set(key, { data: null });
  },

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

  _attributes: {},

  initEvents: function () {
    const service = this.get('service');
    if (service) {
      service.on('didUpdateResource', this, this.didUpdateResource);
    }
  }.on('init'),

  didUpdateResource() {
    this._attributes = {};
  },

  isNew: false
});

export default Resource;

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
        this.get('service').trigger('attributeChanged', this);
      }
      return this.get('attributes.' + key);
    }
  });
}

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
    const proxy = proxyFactory.extend(Ember.PromiseProxyMixin, {
      promise: model.service.findRelated(resource, url)
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

export function hasOne(resource) {
  const util = RelatedProxyUtil.create({'resource': resource});
  return Ember.computed(linksPath(resource), function () {
    util.createProxy(this, Ember.ObjectProxy);
    return util._proxy;
  });
}

export function hasMany(resource) {
  const util = RelatedProxyUtil.create({'resource': resource});
  return Ember.computed(linksPath(resource), function () {
    util.createProxy(this, Ember.ArrayProxy);
    return util._proxy;
  });
}

export function hasRelated() {
  const relationships = {};
  for (let i = 0; i < arguments.length; i++) {
    relationships[arguments[i]] = newRelation();
  }
  return relationships;
}

function newRelation() {
  return { links: {}, data: null };
}
