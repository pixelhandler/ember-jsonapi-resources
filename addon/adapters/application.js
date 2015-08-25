/**
  @module ember-jsonapi-resources
  @submodule adapter
**/

import Ember from 'ember';
import { pluralize } from 'ember-inflector';

/**
  Adapter for a JSON API endpoint, use as a service for your backend

  @class ApplicationAdapter
  @requires Ember.Inflector
  @uses Ember.Evented
  @static
*/
export default Ember.Object.extend(Ember.Evented, {

  /**
    The name of the entity

    @property type
    @type String
    @required
  */
  type: null,

  /**
    The url for the entity, e.g. /posts or /api/v1/posts

    @property url
    @type String
    @required
  */
  url: null,

  /**
    Find resource(s) using an id or a using a query `{id: '', query: {}}`

    @method find
    @param {Object|String} options use a string for a single id or an object
    @return {Promise}
  */
  find(options) {
    if (typeof options === 'string') {
      return this.findOne(options);
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

  /**
    Find a resource by id, optionally pass a query object, e.g. w/ filter param(s)

    Uses a url like: /photos/1

    @method findOne
    @param {String} id
    @param {Object} query
    @return {Promise}
  */
  findOne(id, query) {
    let url = this.get('url') + '/' + id;
    url += (query) ? '?' + Ember.$.param(query) : '';
    return this.fetch(url, { method: 'GET' });
  },

  /**
    Find resources using an optional query object, e.g. w/ pagination params

    @method findQuery
    @param {Object} query
    @return {Promise}
  */
  findQuery(options = {}) {
    let url = this.get('url');
    url += (options.query) ? '?' + Ember.$.param(options.query) : '';
    options = options.options || { method: 'GET' };
    return this.fetch(url, options);
  },

  /**
    Find resources by relationship or use a specificed (optional) service to find relation

    A Url like: /photos/1/relationships/photographer is a required param

    ```js
    service.findRelated('photographer', '/api/v1/photos/1/relationships/photographer');
    ```

    Or, with option to find releated resource using a different service

    ```js
    service.findRelated({resource: 'photographer', type: 'people'}, url);
    ```

    @method findRelated
    @param {String|Object} resource name to lookup the service object w/ serializer
    @param {String} resource.resource the name of the resource
    @param {String} resource.type the name of the resource
    @param {String} url
    @return {Promise}
  */
  findRelated(resource, url) {
    let type = resource;
    if (typeof type === 'object') {
      resource = resource.resource;
      type = resource.type;
    }
    // use resource's service if in container, otherwise use this service to fetch
    let service = this.container.lookup('service:' + pluralize(type)) || this;
    url = this.fetchUrl(url);
    return service.fetch(url, { method: 'GET' });
  },

  /**
    Create a new resource, sends a POST request

    @method createResource
    @param {Resource} the resource instance to serialize
    @return {Promise}
  */
  createResource(resource) {
    let url = this.get('url');
    const json = this.serializer.serialize(resource);
    return this.fetch(url, {
      method: 'POST',
      body: JSON.stringify(json)
    });
  },

  /**
    Patch an existing resource, sends a PATCH request. After promise is resolved
    the `didUpdateResource` event is triggered, given an error response a event
    `resourceError` is triggered. A resource may listen on its `service` reference.

    @method updateResource
    @param {Resource} the resource instance to serialize the changed attributes
    @return {Promise}
  */
  updateResource(resource) {
    let url = resource.get('links.self') || this.get('url') + '/' + resource.get('id');
    const json = this.serializer.serializeChanged(resource);
    if (!json) { return null; }
    return this.fetch(url, {
      method: 'PATCH',
      body: JSON.stringify(json),
      update: true
    }).then(function(json) {
      this.trigger('didUpdateResource', json);
    }.bind(this)).catch(function(resp) {
      this.trigger('resourceError', resp);
    }.bind(this));
  },

  /**
    Patch a relationship, either add or remove, sends a PATCH request

    Adds with payload: `{ "data": { "type": "comments", "id": "12" } }`
    Removes with payload: `{ "data": null }`

    @method patchRelationship
    @param {Resource} the resource instance, has URLs via it's relationships property
    @param {String} resource name (plural) to find the url from the resource instance
    @return {Promise}
  */
  patchRelationship(resource, relationship) {
    let url = resource.get(['relationships', relationship, 'links', 'self'].join('.'));
    url = url || [this.get('url'), resource.get('id'), 'relationships', relationship].join('/');
    let data = resource.get(['relationships', relationship, 'data'].join('.'));
    data = { data: data };
    return this.fetch(url, {
      method: 'PATCH',
      body: JSON.stringify(data)
    }).then(function(json) {
      this.trigger('didUpdateRelationship', json);
    }.bind(this));
  },

  /**
    Delete an existing resource, sends a DELETE request

    @method deleteResource
    @param {String|Resource} the name (plural) or resource instance w/ self link
    @return {Promise}
  */
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

  /**
    Makes a fetch request via Fetch API

    see http://updates.html5rocks.com/2015/03/introduction-to-fetch

    @method fetch
    @param {String} url
    @param {Object} options - may include a query object or an update flag
    @return {Ember.RSVP.Promise}
  */
  fetch(url, options = {}) {
    let isUpdate = this.fetchOptions(options);
    url = this.fetchUrl(url);
    const _this = this;
    return new Ember.RSVP.Promise(function(resolve, reject) {
      window.fetch(url, options).then(function(resp) {
        if (resp.status >= 500) {
          let msg = 'The Service responded with a '+ resp.status +' error.';
          reject(new ServerError(msg, resp));
        } else if (resp.status >= 400) {
          resp.json().then(function(_resp) {
            let msg = 'The API responded with a '+ resp.status +' error.';
            reject(new ClientError(msg, _resp));
          });
        } else if (resp.status === 204) {
          resolve('');
        } else {
          return resp.json().then(function(json) {
            if (isUpdate) {
              _this.cacheUpdate({ meta: json.meta, data: json.data, headers: resp.headers });
              json.data = _this.serializer.transformAttributes(json.data);
              resolve(json.data);
            } else {
              const resource = _this.serializer.deserialize(json);
              _this.cacheResource({ meta: json.meta, data: resource, headers: resp.headers });
              _this.serializer.deserializeIncluded(json.included, { headers: resp.headers });
              resolve(resource);
            }
          });
        }
      }).catch(function(error) {
        let msg = (error && error.message) ? error.message : 'Unable to Fetch resource(s)';
        reject(new FetchError(msg, error));
      });
    });
  },

  /**
    Adds params and headers or Fetch request.

    - The HTTP Header is set for Content-Type: application/vnd.api+json
    - Sets Authorization header if accessible in the `authorizationCredential` property

    @method fetchOptions
    @param {Object} options
    @return {Object}
  */
  fetchOptions(options) {
    let isUpdate;
    options.headers = options.headers || { 'Content-Type': 'application/vnd.api+json' };
    this.fetchAuthorizationHeader(options);
    if (typeof options.update === 'boolean') {
      isUpdate = options.update;
      delete options.update;
    }
    return isUpdate;
  },

  /**
    Sets Authorization header if accessible in the `authorizationCredential` property

    @method fetchAuthorizationHeader
    @param {Object} options
  */
  fetchAuthorizationHeader(options) {
    if (options.headers[this.authorizationHeaderField]) {
      return;
    } else {
      const credential = this.get('authorizationCredential');
      if (credential && this.authorizationHeaderField) {
        options.headers[this.authorizationHeaderField] = credential;
      }
    }
  },

  /**
    Authentication credentials/token used with HTTP authentication
    This property should be added by an Authorization Mixin

    @property authorizationCredential
    @type String
  */
  authorizationCredential: null,

  /**
    The name of the Authorization request-header field
    This property should be added by an Authorization Mixin

    @property authorizationHeaderField
    @type String
  */
  authorizationHeaderField: null,

  /**
    Hook to customize the URL, e.g. if your API is behind a proxy and you need
    to swap a portion of the domain to make a request on the same domain.

    @method fetchUrl
    @param {String} url
    @return {String}
  */
  fetchUrl(url) {
    return url;
  },

  /**
    Noop as a hook for defining how deserialized resource objects are cached,
    e.g. in memory

    @method cacheResource
    @param {Object} resp w/ props: {Object} meta, {Array|Object} data, & {Object} headers
  */
  cacheResource(/*resp*/) {},

  /**
    Noop as a hook for defining how to handle cache after updating a resource

    @method cacheUpdate
    @param {Object} resp w/ props: {Object} meta, {Array|Object} data, & {Object} headers
  */
  cacheUpdate(/*resp*/) {},

  /**
    Initialize events to communicate on the resource instances' service reference.
    Listens for resource objects trigging `attributeChanged` events

    @method initEvents
  */
  initEvents: Ember.on('init', function () {
    this.on('attributeChanged', this, this.updateResource);
  })
});

function ServerError(message = 'Server Error', response = null) {
  this.name = 'ServerError';
  this.message = message;
  this.response = response;
  this.errors = response.errors || null;
}
ServerError.prototype = Object.create(Error.prototype);
ServerError.prototype.constructor = ServerError;

function ClientError(message = 'Client Error', response = null) {
  this.name = 'ClientError';
  this.message = message;
  this.response = response;
  this.errors = response.errors || null;
  this.errors = (response) ? response.errors || null : null;
}
ClientError.prototype = Object.create(Error.prototype);
ClientError.prototype.constructor = ClientError;

function FetchError(message = 'Fetch Error', error = null, response = null) {
  this.name = 'FetchError';
  this.message = message;
  this.stack = (error) ? error.stack || null : null;

  this.error = error;
  this.response = response;
}
FetchError.prototype = Object.create(Error.prototype);
FetchError.prototype.constructor = FetchError;
