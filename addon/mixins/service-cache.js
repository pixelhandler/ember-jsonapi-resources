/**
  @module ember-jsonapi-resources
  @submodule cache
**/

import Ember from 'ember';

/**
  A Mixin class for caching JSON API resource objects

  @class ServiceCacheMixin
  @requires Ember.Inflector
  @static
*/
export default Ember.Mixin.create({

  /**
    Cache object

    @property cache
    @type Object
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
    const ids = this.cache.data.mapBy('id');
    if (!ids) { return; }
    if (Array.isArray(resp.data)) {
      if (ids.length === 0) {
        for (let i = 0; i < resp.data.length; i++) {
          this.cacheControl(resp.data[i], resp.headers);
        }
        this.cache.data.pushObjects(resp.data);
      } else {
        this.cacheUpdate(resp);
      }
    } else if (typeof resp === 'object') {
      if (ids.length === 0) {
        this.cache.data.pushObject(resp.data);
        this.cacheControl(resp.data, resp.headers);
      } else {
        if (ids.indexOf(resp.data.get('id')) === -1) {
          this.cache.data.pushObject(resp.data);
        } else  {
          this.cacheUpdate(resp);
        }
      }
    }
  },

  /**
    Add or update cache data

    @method cacheUpdate
    @param {Object} resp w/ props: {Object} meta, {Array|Object} data, & {Object} headers
  */
  cacheUpdate(resp) {
    const ids = this.cache.data.mapBy('id');
    if (!Array.isArray(resp.data) && typeof resp.data === 'object') {
      resp.data = [ resp.data ];
    }
    let index, id, item, isResourceType;
    for (let i = 0; i < resp.data.length; i++) {
      id = resp.data[i].id || resp.data[i].get('id');
      index = ids.indexOf(id);
      isResourceType = resp.data[i].toString().indexOf('JSONAPIResource') > -1;
      if (index === -1 && isResourceType) {
        this.cache.data.pushObject(resp.data[i]);
      } else if (isResourceType) {
        this.cache.data.replaceContent(index, 1, resp.data[i]);
      } else if (index > -1) {
        item = this.cache.data.findBy('id', id);
        item.didUpdateResource(resp.data[i]);
      }
      this.cacheControl(item || this.cache.data.findBy('id', id), resp.headers);
    }
  },

  /**
    Store meta from headers on resource meta, window.fetch includes
    a headers object in the response use `headers.get` to lookup data
    from the headers for cache-control, date, and etag.

    @method cacheControl
    @param {Resource} resource
    @param {Object} headers
  */
  cacheControl(resource, headers) {
    if (!resource) { return; }
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
    @return {Resource|undefined}
  */
  cacheLookup(id) {
    return this.cache.data.find(function(resource) {
      const isExpired = resource.get('isCacheExpired');
      if (isExpired) {
        Ember.run.next(this.cache.data, 'removeObject', resource);
      }
      return resource.get('id') === id && !isExpired;
    }.bind(this));
  },

  /**
    Remove a resource from cached data

    @method cacheRemove
    @param {Resource} resource
  */
  cacheRemove(resource) {
    this.cache.data.removeObject(resource);
  }
});
