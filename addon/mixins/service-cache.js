/**
  @module ember-jsonapi-resources
  @submodule cache
**/

import Ember from 'ember';

/**
  A Mixin class for caching JSON API resource objects

  @class ServiceCacheMixin
  @requires Ember.Inflector
*/
export default Ember.Mixin.create({

  /**
    Cache object

    @property cache
  */
  cache: null,

  /**
    Initialize a cache object

    @method initCache
  */
  initCache: Ember.on('init', function () {
    this.cache = {
      meta: null,
      data: Ember.ArrayProxy.create({ content: Ember.A([]) })
    };
  }),

  /**
    Store response object(s) in the cache

    @method cacheResource
  */
  cacheResource(resp) {
    this.cacheMeta(resp);
    this.cacheData(resp);
  },

  /**
    Store meta data in the cache

    @method cacheMeta
  */
  cacheMeta(resp) {
    if (resp.meta) {
      this.set('cache.meta', resp.meta);
    }
  },

  /**
    Store resource objects in the `data` array of the cache

    @method cacheData
  */
  cacheData(resp) {
    const data = this.get('cache.data');
    const ids = data.mapBy('id');
    if (Array.isArray(resp.data)) {
      if (data.get('length') === 0) {
        data.pushObjects(resp.data);
      } else {
        const items = Ember.A([]);
        for (let i = 0; i < resp.data.length; i++) {
          if (ids.indexOf(resp.data[i].get('id')) === -1) {
            items.push(resp.data[i]);
          }
        }
        if (items.length > 0) {
          data.pushObjects(items);
        }
      }
    } else if (typeof resp === 'object') {
      if (ids.indexOf(resp.data.get('id')) === -1) {
        data.pushObject(resp.data);
      }
    }
  }
});
