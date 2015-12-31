/**
  @module ember-jsonapi-resources
  @submodule fetch
**/
import Ember from 'ember';
import { ServerError, ClientError, FetchError } from 'ember-jsonapi-resources/utils/errors';

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

    See http://updates.html5rocks.com/2015/03/introduction-to-fetch

    @private
    @method _fetch
    @param {String} url
    @param {Object} options - May include a query object or an update flag
    @param {Boolean} isUpdate
    @return {Ember.RSVP.Promise}
  */
  _fetch(url, options, isUpdate) {
    return new Ember.RSVP.Promise(function(resolve, reject) {
      window.fetch(url, options).then(function(response) {
        if (response.status >= 500) {
          this.fetchServerErrorHandler(response, reject);
        } else if (response.status >= 400) {
          this.fetchClientErrorHandler(response, reject);
        } else if (response.status === 204) {
          this.fetchNoContentHandler(response, resolve);
        } else {
          return this.fetchSuccessHandler(response, resolve, isUpdate);
        }
      }.bind(this)).catch(function(error) {
        this.fetchErrorHandler(error, reject);
      }.bind(this));
    }.bind(this));
  },

  /**
    @method fetchServerErrorHandler - Server Error status >= 500
    @param {Response} response - Fetch response
    @param {Function} reject - Promise reject handler
  */
  fetchServerErrorHandler(response, reject) {
    let msg = 'The Service responded with a '+ response.status +' error.';
    reject(new ServerError(msg, response));
  },

  /**
    @method fetchClientErrorHandler - Client Error status >= 400
    @param {Response} response - Fetch response
    @param {Function} reject - Promise reject handler
  */
  fetchClientErrorHandler(response, reject) {
    response.text().then(function(resp) {
      let json, msg = 'The API responded with a '+ response.status +' error.';
      try {
        json = JSON.parse(resp);
      } catch (e) {
        Ember.Logger.error(e);
        json = { "errors": [ { "status": response.status } ] };
      }
      reject(new ClientError(msg, json));
    });
  },

  /**
    @method fetchErrorHandler - Generic error handler
    @param {Response} response - Fetch response
    @param {Function} reject - Promise reject handler
  */
  fetchErrorHandler(error, reject) {
    let msg = (error && error.message) ? error.message : 'Unable to Fetch resource(s)';
    reject(new FetchError(msg, error));
  },

  /**
    @method fetchClientErrorHandler
    @param {Response} response - Fetch response
    @param {Function} resolve - Promise resolve handler
  */
  fetchNoContentHandler(response, resolve) {
    return response.text().then(function(resp) {
      resolve(resp || '');
    });
  },

  /**
    @method fetchSuccessHandler
    @param {Response} response - Fetch response
    @param {Function} resolve - Promise resolve handler
    @param {Boolean} isUpdate - Used with patch to update a resource
  */
  fetchSuccessHandler(response, resolve, isUpdate) {
    return response.json().then(function(json) {
      if (isUpdate) {
        json.data = this.serializer.transformAttributes(json.data);
        this.cacheUpdate({ meta: json.meta, data: json.data, headers: response.headers });
        resolve(json.data);
      } else {
        let resource = this.serializer.deserialize(json);
        this.cacheResource({ meta: json.meta, data: resource, headers: response.headers });
        this.serializer.deserializeIncluded(json.included, { headers: response.headers });
        resolve(resource);
      }
    }.bind(this));
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
    return new Ember.RSVP.Promise(function(resolve, reject) {
      Ember.$.ajax(url, options)
        .done(this.ajaxDoneHandler(resolve, isUpdate))
        .fail(this.ajaxFailHandler(reject));
    }.bind(this));
  },

  /**
    @method ajaxDoneHandler
    @param {Function} reject - Promise reject handler
    @return {Function} closure with reject handler
  */
  ajaxFailHandler(reject) {
    let _reject = reject;
    /*
      @param {Object} jqXHR
      @param {String} textStatus
      @param {String} errorThrown
    */
    return function(jqXHR, textStatus, errorThrown) {
      if (jqXHR.status >= 500) {
        this.ajaxServerErrorHandler(jqXHR, textStatus, errorThrown, _reject);
      } else if (jqXHR.status >= 400) {
        this.ajaxClientErrorHandler(jqXHR, textStatus, errorThrown, _reject);
      } else {
        this.ajaxErrorHandler(jqXHR, textStatus, errorThrown, _reject);
      }
    }.bind(this);
  },

  /**
    @method ajaxDoneHandler
    @param {Function} resolve - Promise resolve handler
    @param {Boolean} isUpdate - Used with patch to update a resource
    @return {Function} closure with resolve handler
  */
  ajaxDoneHandler(resolve, isUpdate) {
    let _resolve = resolve, _isUpdate = isUpdate;
    /*
      @param {Object} json - payload
      @param {String} textStatus
      @param {jqXHR} jqXHR
    */
    return function(json, textStatus, jqXHR) {
      if (jqXHR.status === 204) {
        this.ajaxNoContentHandler(json, textStatus, jqXHR, _resolve);
      } else {
        this.ajaxSuccessHandler(json, textStatus, jqXHR, _resolve, _isUpdate);
      }
    }.bind(this);
  },

  /**
    @method ajaxServerErrorHandler - Server error status >= 500
    @param {Object} jqXHR
    @param {String} textStatus
    @param {String} errorThrown
    @param {Function} reject - Promise reject handler
  */
  ajaxServerErrorHandler(jqXHR, textStatus, errorThrown, reject) {
    let msg = 'The Service responded with ' + textStatus + ' ' + jqXHR.status;
    reject(new ServerError(msg, jqXHR.responseJSON || jqXHR.responseText || errorThrown));
  },

  /**
    @method ajaxClientErrorHandler - Client Error status >= 400
    @param {Object} jqXHR
    @param {String} textStatus
    @param {String} errorThrown
    @param {Function} reject - Promise reject handler
  */
  ajaxClientErrorHandler(jqXHR, textStatus, errorThrown, reject) {
    let msg = 'The API responded with a '+ jqXHR.status +' error.';
    let json = jqXHR.responseJSON;
    if (!json) {
      json = {
        "errors": [
          {
            "status": jqXHR.status,
            "detail": jqXHR.responseText,
            "message": errorThrown
          }
        ]
      };
    }
    reject(new ClientError(msg, json));
  },

  /**
    @method ajaxErrorHandler - Generic error handler
    @param {Object} jqXHR
    @param {String} textStatus
    @param {String} errorThrown
    @param {Function} reject - Promise reject handler
  */
  ajaxErrorHandler(jqXHR, textStatus, errorThrown, reject) {
    let msg = (errorThrown) ? errorThrown : 'Unable to Fetch resource(s)';
    reject(new FetchError(msg, {
      code: jqXHR.status,
      message: errorThrown,
      'status': textStatus,
      response: jqXHR.responseText
    }));
  },

  /**
    @method ajaxNoContentHandler
    @param {Object} json - payload should be empty
    @param {String} textStatus
    @param {jqXHR} jqXHR
    @param {Function} resolve - Promise resolve handler
  */
  ajaxNoContentHandler(json, textStatus, jqXHR, resolve) {
    resolve(json || '');
  },

  /**
    @method ajaxSuccessHandler
    @param {Object} json - payload
    @param {String} textStatus
    @param {jqXHR} jqXHR
    @param {Function} resolve - Promise resolve handler
    @param {Boolean} isUpdate - Used with patch to update a resource
  */
  ajaxSuccessHandler(json, textStatus, jqXHR, resolve, isUpdate) {
    let headers = this._getAjaxHeaders(jqXHR);
    if (isUpdate) {
      json.data = this.serializer.transformAttributes(json.data);
      this.cacheUpdate({ meta: json.meta, data: json.data, headers: headers });
      resolve(json.data);
    } else {
      let resource = this.serializer.deserialize(json);
      this.cacheResource({ meta: json.meta, data: resource, headers: headers });
      this.serializer.deserializeIncluded(json.included, { headers: headers });
      resolve(resource);
    }
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
