import Ember from 'ember';
import { pluralize } from 'ember-inflector';

export default Ember.Object.extend(Ember.Evented, {
  type: null,

  find(options) {
    const hasIdList = (typeof options === 'string' && options.match(',') !== null);
    if (typeof options === 'string') {
      return this.findOne(options);
    } else if (hasIdList || Array.isArray(options)) {
      return this.findMany(options);
    } else if (typeof options === 'object') {
      if (options.id) {
        return this.findOne(options.id, options.query);
      } else {
        return this.findQuery(options);
      }
    } else {
      return this.findQuery();
    }
  },

  findOne(id, query) {
    let url = this.get('url') + '/' + id;
    url += (query) ? '?' + Ember.$.param(query) : '';
    return this.fetch(url, { method: 'GET' });
  },

  findMany(ids) {
    ids = (Array.isArray(ids)) ? ids.split(',') : ids;
    const url = this.get('url') + '/' + ids;
    return this.fetch(url, { method: 'GET' });
  },

  findQuery(options = {}) {
    let url = this.get('url');
    url += (options.query) ? '?' + Ember.$.param(options.query) : '';
    options = options.options || { method: 'GET' };
    return this.fetch(url, options);
  },

  findRelated(resource, url) {
    const service = this.container.lookup('service:' + pluralize(resource));
    return service.fetch(url);
  },

  createResource(resource) {
    let url = this.get('url');
    const json = this.serializer.serialize(resource);
    return this.fetch(url, {
      method: 'POST',
      body: JSON.stringify(json)
    });
  },

  updateResource(resource) {
    let url = resource.get('links.self') || this.get('url') + '/' + resource.get('id');
    const json = this.serializer.serializeChanged(resource);
    return this.fetch(url, {
      method: 'PATCH',
      body: JSON.stringify(json)
    }).then(function(json) {
      this.trigger('didUpdateResource', json);
    }.bind(this));
  },

  patchRelationship(resource, relationship) {
    let url = ['relationships', relationship, 'links', 'self'].join('');
    url = url || [this.get('url'), resource.get('id'), 'relationships', relationship].join('/');
    url = resource.get(url);
    let data = ['relationships', relationship, 'data'].join('');
    data = resource.get(data);
    return this.fetch(url, {
      method: 'PATCH',
      body: JSON.stringify(data)
    }).then(function(json) {
      this.trigger('didUpdateRelationship', json);
    }.bind(this));
  },

  deleteResource(resource) {
    let url = this.get('url') + '/';
    if (typeof resource === 'string') {
      url += resource;
    } else {
      url = resource.get('links.self') || url + resource.get('id');
      resource.destroy();
    }
    return this.fetch(url, { method: 'DELETE' });
  },

  fetch(url, options = {}) {
    let isUpdate = this.fetchOptions(options);
    url = this.fetchUrl(url);
    return window.fetch(url, options).then(function(resp) {
      if (resp.status >= 500) {
        throw new Error('Server Error');
      } else if (resp.status >= 400) {
        resp.json().then(function(resp) {
          // TODO handle errors better
          throw new Error(resp.errors);
        });
      } else if (resp.status === 204) {
        return '';
      } else {
        return resp.json().then(function(json) {
          if (!isUpdate) {
            const resource = this.serializer.deserialize(json);
            this.cacheResource({ meta: json.meta, data: resource});
            return resource;
          } else {
            return json;
          }
        }.bind(this));
      }
    }.bind(this)).catch(function(error) {
      throw error;
    });
  },

  fetchOptions(options) {
    let isUpdate;
    options.headers = options.headers || { 'Content-Type': 'application/vnd.api+json' };
    const authHeader = window.localStorage.getItem('AuthorizationHeader');
    if (authHeader) {
      options.headers['Authorization'] = authHeader;
    }
    if (typeof options.update === 'boolean') {
      isUpdate = options.update;
      delete options.update;
    }
    return isUpdate;
  },

  fetchUrl(url) {
    return url;
  },

  cacheResource(/*resp*/) {},

  initEvents: Ember.on('init', function () {
    this.on('attributeChanged', this, this.updateResource);
  })
});
