/**
  @module ember-jsonapi-resources
  @submodule adapters
**/

import Ember from 'ember';
import RSVP from 'rsvp';
import { pluralize } from 'ember-inflector';
import FetchMixin from 'ember-jsonapi-resources/mixins/fetch';

const { Evented, getOwner } = Ember;

/**
  Adapter for a JSON API endpoint, use as a service for your backend

  @class ApplicationAdapter
  @requires Ember.Inflector
  @uses Ember.Evented
  @static
*/
export default Ember.Object.extend(FetchMixin, Evented, {

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
    @param {Object|String|Number} options use a string for a single id or an object.
    @return {Promise}
  */
  find(options) {
    // Collect id and query from options (if given).
    // Ensure id is String conform JSONAPI specs.
    // findOne when id is given, otherwise findQuery.
    let id, query;

    if (options !== undefined) {
      if (typeof options === 'object') {
        query = options; // default

        if (options.hasOwnProperty('id')) {
          id    = options.id.toString();
          query = options.query;
        }
      } else {
        id = options.toString();
      }
    }

    // this works even for id 0 since it is cast to string.
    return id ? this.findOne(id, query) : this.findQuery(query);
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
    @param {Object} options
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
    let owner = (typeof getOwner === 'function') ? getOwner(this) : this.container;
    let service = owner.lookup('service:' + pluralize(type)) || this;
    url = this.fetchUrl(url);
    return service.fetch(url, { method: 'GET' });
  },

  /**
    Create a new resource, sends a POST request, updates resource instance
    with persisted data, and updates cache with persisted resource

    @method createResource
    @param {Resource} resource the instance to serialize
    @return {Promise}
  */
  createResource(resource) {
    let url = this.get('url');
    const json = this.serializer.serialize(resource);
    return this.fetch(url, {
      method: 'POST',
      body: JSON.stringify(json)
    }).then(function(resp) {
      if (resource.toString().match('JSONAPIResource') === null) {
        return resp;
      } else {
        resource.set('id', resp.get('id') );
        let json = resp.getProperties('attributes', 'relationships', 'links', 'meta', 'type', 'isNew', 'id');
        resource.didUpdateResource(json);
        this.cacheUpdate({ data: resource });
        return resource;
      }
    }.bind(this));
  },

  /**
    Patch an existing resource, sends a PATCH request.

    @method updateResource
    @param {Resource} resource instance to serialize the changed attributes
    @return {Promise} resolves with PATCH response or `null` if nothing to update
  */
  updateResource(resource) {
    let url = resource.get('links.self') || this.get('url') + '/' + resource.get('id');
    const json = this.serializer.serializeChanged(resource);
    if (!json) {
      return RSVP.Promise.resolve(null);
    }
    return this.fetch(url, {
      method: 'PATCH',
      body: JSON.stringify(json),
      update: true
    });
  },

  /**
    Delete an existing resource, sends a DELETE request

    @method deleteResource
    @param {String|Resource} resource name (plural) or instance w/ self link
    @return {Promise}
  */
  deleteResource(resource) {
    let url = this.get('url') + '/';
    if (typeof resource === 'string') {
      url += resource;
    } else {
      url = resource.get('links.self') || url + resource.get('id');
      this.cacheRemove(resource);
      resource.destroy();
    }
    return this.fetch(url, { method: 'DELETE' });
  },

  /**
    Create (add) a relationship for `to-many` relation, sends a POST request.

    See: <http://jsonapi.org/format/#crud-updating-to-many-relationships>

    Adds a relation using a payload with a resource identifier object:

    ```
    {
      "data": [
        { "type": "comments", "id": "12" }
      ]
    }
    ```

    @method createRelationship
    @param {Resource} resource instance, has URLs via it's relationships property
    @param {String} relationship name (plural) to find the url from the resource instance
    @param {String} id of the related resource
    @return {Promise}
  */
  createRelationship(resource, relationship, id) {
    return this.fetch(this._urlForRelationship(resource, relationship), {
      method: 'POST',
      body: JSON.stringify(this._payloadForRelationship(resource, relationship, id))
    });
  },

  /**
    Patch a relationship, either adds or removes everyting, sends a PATCH request.

    See: <http://jsonapi.org/format/#crud-updating-to-one-relationships>

    For `to-one` relation:

    - Remove (delete) with payload: `{ "data": null }`
    - Create/Update with payload:
      ```
      {
        "data": { "type": "comments", "id": "1" }
      }
      ```

    For `to-many` relation:

    - Remove (delete) all with payload: `{ "data": [] }`
    - Replace all with payload:
      ```
      {
        "data": [
          { "type": "comments", "id": "1" },
          { "type": "comments", "id": "2" }
        ]
      }
      ```

    @method patchRelationship
    @param {Resource} resource instance, has URLs via it's relationships property
    @param {String} relationship name (plural) to find the url from the resource instance
    @return {Promise}
  */
  patchRelationship(resource, relationship) {
    return this.fetch(this._urlForRelationship(resource, relationship), {
      method: 'PATCH',
      body: JSON.stringify({
        data: resource.get(['relationships', relationship, 'data'].join('.'))
      })
    });
  },

  /**
    Deletes a relationship for `to-many` relation, sends a DELETE request.

    See: <http://jsonapi.org/format/#crud-updating-to-many-relationships>

    Remove using a payload with the resource identifier object:

    For `to-many`:

    ```
    {
      "data": [
        { "type": "comments", "id": "1" }
      ]
    }
    ```

    @method deleteRelationship
    @param {Resource} resource instance, has URLs via it's relationships property
    @param {String} relationship name (plural) to find the url from the resource instance
    @param {String} id of the related resource
    @return {Promise}
  */
  deleteRelationship(resource, relationship, id) {
    return this.fetch(this._urlForRelationship(resource, relationship), {
      method: 'DELETE',
      body: JSON.stringify(this._payloadForRelationship(resource, relationship, id))
    });
  },

  /**
    @method _urlForRelationship
    @private
    @param {Resource} resource instance, has URLs via it's relationships property
    @param {String} relationship name (plural) to find the url from the resource instance
    @return {String} url
  */
  _urlForRelationship(resource, relationship) {
    let url = resource.get(['relationships', relationship, 'links', 'self'].join('.'));
    return url || [this.get('url'), resource.get('id'), 'relationships', relationship].join('/');
  },

  /**
    @method _payloadForRelationship
    @private
    @param {Resource} resource instance, has URLs via it's relationships property
    @param {String} relationship name (plural) to find the url from the resource instance
    @param {String} id the id for the related resource
    @return {Object} payload
  */
  _payloadForRelationship(resource, relationship, id) {
    let data = resource.get(['relationships', relationship, 'data'].join('.'));
    let resourceObject = { type: pluralize(relationship), id: id.toString() };
    return { data: (Array.isArray(data)) ? [resourceObject] : resourceObject };
  },

  /**
    Fetches data using Fetch API or XMLHttpRequest

    @method fetch
    @param {String} url
    @param {Object} options may include a query object or an update flag
    @return {Promise}
  */
  fetch(url, options = {}) {
    url = this.fetchUrl(url);
    let isUpdate = this.fetchOptions(options);
    if (this.get('useFetch')) {
      return this._fetch(url, options, isUpdate);
    } else {
      return this._ajax(url, options, isUpdate);
    }
  },

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
    options.credentials = options.credentials || 'same-origin';
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
    Noop as a hook to remove a resource from cached data

    @method cacheRemove
    @param {Resource} resource
  */
  cacheRemove(/*resource*/) {}
});
