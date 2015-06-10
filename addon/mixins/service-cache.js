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
    @param {Object} resp w/ props: {Object} meta, {Array|Object} data, & {Object} headers
  */
  cacheResource(resp) {
    this.cacheMeta(resp);
    this.cacheData(resp);
  },

  /**
    Store meta data in the cache

    @method cacheMeta
    @param {Object} resp w/ props: {Object} meta, {Array|Object} data, & {Object} headers
  */
  cacheMeta(resp) {
    if (resp.meta) {
      this.set('cache.meta', resp.meta);
    }
  },

  /**
    Store resource objects in the `data` array of the cache

    @method cacheData
    @param {Object} resp w/ props: {Object} meta, {Array|Object} data, & {Object} headers
  */
  cacheData(resp) {
    const data = this.get('cache.data');
    const ids = data.mapBy('id');
    if (Array.isArray(resp.data)) {
      if (data.get('length') === 0) {
        for (let i = 0; i < resp.data.length; i++) {
          this.cacheControl(resp.data[i], resp.headers);
        }
        data.pushObjects(resp.data);
      } else {
        const items = Ember.A([]);
        for (let j = 0; j < resp.data.length; j++) {
          if (ids.indexOf(resp.data[j].get('id')) === -1) {
            items.push(resp.data[j]);
          }
          this.cacheControl(resp.data[j], resp.headers);
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
  },

  /**
    Store meta from headers on resource meta

    @method cacheControl
    @param {Resource} resource
    @param {Object} headers
  */
  cacheControl(resource, headers) {
    resource.set('meta.timeStamps', { local: Date.now() });
    if (headers && typeof headers.get === 'function') {
      let date = headers.get('date');
      if (date) {
        resource.set('meta.timeStamps.server', date);
      }
      let cacheControl = headers.get('cache-control');
      if (cacheControl) {
        resource.set('meta.cacheControl', cacheControl);
      }
      let etag = headers.get('etag');
      if (etag) {
        resource.set('meta.etag', etag);
      }
    }
  },

  /**
    Lookup a resource from cached data

    @method cacheLookup
    @param {String} id
    @returns {Resource|undefined}
  */
  cacheLookup(id) {
    return this.cache.data.find(function(resource) {
      const isExpired = resource.get('isCacheExpired');
      if (isExpired) {
        Ember.run.next(this.cache.data, 'removeObject', resource);
      }
      return resource.get('id') === id && !isExpired;
    }.bind(this));
  }
});
