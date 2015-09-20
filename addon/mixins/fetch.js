/**
  @module ember-jsonapi-resources
  @submodule fetch
**/
import Ember from 'ember';

/**
  Fetch/Ajax methods for use with an Adapter calls `cacheUpdate`, `cacheResource`
  methods and a `serializer` injection.

  @class FetchMixin
*/
export default Ember.Mixin.create({
  /**
    Flag indicates whether to use window.fetch or not

    @property useFetch
    @type Boolean
  */
  useFetch: Ember.computed('useAjax', function () {
    let notFirefox = window.navigator.userAgent.indexOf("Firefox") === -1;
    return !this.get('useAjax') && window.fetch && notFirefox;
  }),

  /**
    Flag to use $.ajax instead of window.fetch

    @property useAjax
    @type Boolean
  */
  useAjax: false,

  /**
    Makes a fetch request via Fetch API (may use polyfill)

    see http://updates.html5rocks.com/2015/03/introduction-to-fetch

    @private
    @method _fetch
    @param {String} url
    @param {Object} options - may include a query object or an update flag
    @param {Boolean} isUpdate
    @return {Ember.RSVP.Promise}
  */
  _fetch(url, options, isUpdate) {
    let _this = this;
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
              let resource = _this.serializer.deserialize(json);
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
    Makes an XHR request via $.ajax

    @private
    @method _ajax
    @param {String} url
    @param {Object} options - may include a query object or an update flag
    @param {Boolean} isUpdate
    @return {Ember.RSVP.Promise}
    @requires jQuery
  */
  _ajax(url, options, isUpdate) {
    options.data = options.body;
    delete options.body;
    let _this = this;
    return new Ember.RSVP.Promise(function(resolve, reject) {
      Ember.$.ajax(url, options).done(function(json, textStatus, jqXHR) {
        if (jqXHR.status === 204) {
          resolve('');
        } else {
          let headers = _this._getAjaxHeaders(jqXHR);
          if (isUpdate) {
            _this.cacheUpdate({ meta: json.meta, data: json.data, headers: headers });
            json.data = _this.serializer.transformAttributes(json.data);
            resolve(json.data);
          } else {
            let resource = _this.serializer.deserialize(json);
            _this.cacheResource({ meta: json.meta, data: resource, headers: headers });
            _this.serializer.deserializeIncluded(json.included, { headers: headers });
            resolve(resource);
          }
        }
      }).fail(function(jqXHR, textStatus, errorThrown) {
        let msg;
        if (jqXHR.status >= 500) {
          msg = 'The Service responded with ' + textStatus + ' ' + jqXHR.status;
          reject(new ServerError(msg, jqXHR.responseJSON || jqXHR.responseText));
        } else if (jqXHR.status >= 400) {
          msg = 'The API responded with a '+ jqXHR.status +' error.';
          reject(new ClientError(msg, jqXHR.responseJSON || jqXHR.responseText));
        } else {
          msg = (errorThrown) ? errorThrown : 'Unable to Fetch resource(s)';
          reject(new FetchError(msg, {
            code: jqXHR.status,
            message: errorThrown,
            'status': textStatus,
            response: jqXHR.responseText
          }));
        }
      });
    });
  },

  /**
    @private
    @method _getXHRHeaders
    @param {Object} jqXHR
    @return {Object}
  */
  _getAjaxHeaders(jqXHR) {
    let headers = jqXHR.getAllResponseHeaders();
    headers = headers.split('\n');
    let headersDictionary = {}, key, value, header;
    for (let i = 0; i < headers.length; i++) {
      header = headers[i].split(': ');
      if (header[0].trim() !== '') {
        key = header[0].trim();
        value = header[1].trim();
        headersDictionary[key] = value;
      }
    }
    return headersDictionary;
  }

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
