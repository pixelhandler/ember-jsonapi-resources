import Ember from 'ember';

export default Ember.Mixin.create({
  cache: null,

  initCache: function() {
    this.cache = {
      meta: null,
      data: Ember.ArrayProxy.create({ content: [] })
    };
  }.on('init'),

  cacheResource(resp) {
    this.cacheMeta(resp);
    this.cacheData(resp);
  },

  cacheMeta(resp) {
    if (resp.meta) {
      this.set('cache.meta', resp.meta);
    }
  },

  cacheData(resp) {
    const data = this.get('cache.data');
    const ids = data.mapBy('id');
    if (Array.isArray(resp.data)) {
      if (data.get('length') === 0) {
        data.pushObjects(resp.data);
      } else {
        const items = [];
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
