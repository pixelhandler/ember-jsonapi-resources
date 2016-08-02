/**
  @module ember-jsonapi-resources
  @submodule fetch
**/
import Ember from 'ember';
import RSVP from 'rsvp';
import { ServerError, ClientError, FetchError } from 'ember-jsonapi-resources/utils/errors';

/**
  Fetch/Ajax methods for use with an Adapter calls `cacheUpdate`, `cacheResource`
  methods and a `serializer` injection.

  @class FetchMixin
  @static
*/
export default Ember.Mixin.create({
  /**
    Flag indicates whether to use window.fetch or not, computed from `useAjax`

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
    @return {Promise}
  */
  _fetch(url, options, isUpdate) {
    return new RSVP.Promise(function(resolve, reject) {
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
    Fetch server error handler ~ status >= 500

    @method fetchServerErrorHandler
    @param {Response} response - Fetch response
    @param {Function} reject - Promise reject handler
  */
  fetchServerErrorHandler(response, reject) {
    response.text().then(function(respText) {
      let msg = parseFetchErrorMessage(response);
      let json = parseFetchErrorText(respText, response);
      reject(new ServerError(msg, json));
    });
  },

  /**
    Fetch client error handler ~ status >= 400

    @method fetchClientErrorHandler
    @param {Response} response - Fetch response
    @param {Function} reject - Promise reject handler
  */
  fetchClientErrorHandler(response, reject) {
    response.text().then(function(respText) {
      let msg = parseFetchErrorMessage(response);
      let json = parseFetchErrorText(respText, response);
      reject(new ClientError(msg, json));
    });
  },

  /**
    Fetch generic error handler

    @method fetchErrorHandler
    @param {Error|Response} error - Fetch error or response object
    @param {Function} reject - Promise reject handler
  */
  fetchErrorHandler(error, reject) {
    let msg = 'Unable to Fetch resource(s)';
    if (error instanceof Error) {
      msg = (error && error.message) ? error.message : msg;
      reject(new FetchError(msg, error));
    } else if (typeof error.text === 'function') {
      error.text().then(function(respText) {
        msg = parseFetchErrorMessage(error);
        reject(new FetchError(msg, parseFetchErrorText(respText, error)));
      });
    } else {
      reject(new FetchError(msg, error));
    }
  },

  /**
    Fetch 204 No Content handler

    @method fetchNoContentHandler
    @param {Response} response - Fetch response
    @param {Function} resolve - Promise resolve handler
  */
  fetchNoContentHandler(response, resolve) {
    return response.text().then(function(resp) {
      resolve(resp || '');
    });
  },

  /**
    Fetch 20x Success handler

    @method fetchSuccessHandler
    @param {Response} response - Fetch response
    @param {Function} resolve - Promise resolve handler
    @param {Boolean} isUpdate - Used with patch to update a resource
  */
  fetchSuccessHandler(response, resolve, isUpdate) {
    return response.json().then(function(json) {
      if (json.data === null) {
        resolve(null);
      } else if (isUpdate) {
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
    @return {Promise}
    @requires jQuery
  */
  _ajax(url, options, isUpdate) {
    options.data = options.body;
    delete options.body;
    return new RSVP.Promise(function(resolve, reject) {
      Ember.$.ajax(url, options)
        .done(this.ajaxDoneHandler(resolve, isUpdate))
        .fail(this.ajaxFailHandler(reject));
    }.bind(this));
  },

  /**
    @method ajaxFailHandler
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
    Ajax server error handler ~ status >= 500

    @method ajaxServerErrorHandler
    @param {Object} jqXHR
    @param {String} textStatus
    @param {String} errorThrown
    @param {Function} reject - Promise reject handler
  */
  ajaxServerErrorHandler(jqXHR, textStatus, errorThrown, reject) {
    let msg = 'The Service responded with ' + textStatus + ' ' + jqXHR.status;
    let json = parseXhrErrorResponse(jqXHR, errorThrown);
    reject(new ServerError(msg, json));
  },

  /**
    Ajax client error handler ~ status >= 400

    @method ajaxClientErrorHandler
    @param {Object} jqXHR
    @param {String} textStatus
    @param {String} errorThrown
    @param {Function} reject - Promise reject handler
  */
  ajaxClientErrorHandler(jqXHR, textStatus, errorThrown, reject) {
    let msg = 'The API responded with a '+ jqXHR.status +' error.';
    let json = parseXhrErrorResponse(jqXHR, errorThrown);
    reject(new ClientError(msg, json));
  },

  /**
    Ajax Generic error handler

    @method ajaxErrorHandler
    @param {Object} jqXHR
    @param {String} textStatus
    @param {String} errorThrown
    @param {Function} reject - Promise reject handler
  */
  ajaxErrorHandler(jqXHR, textStatus, errorThrown, reject) {
    let msg = (errorThrown) ? errorThrown : 'Unable to Fetch resource(s)';
    let json = parseXhrErrorResponse(jqXHR, errorThrown);
    reject(new FetchError(msg, json));
  },

  /**
    Ajax 204 No Content handler

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
    Ajax 20x Success handler

    @method ajaxSuccessHandler
    @param {Object} json - payload
    @param {String} textStatus
    @param {jqXHR} jqXHR
    @param {Function} resolve - Promise resolve handler
    @param {Boolean} isUpdate - Used with patch to update a resource
  */
  ajaxSuccessHandler(json, textStatus, jqXHR, resolve, isUpdate) {
    if (json.data === null) {
      resolve(null);
      return;
    }
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

function parseFetchErrorMessage(response) {
  return [
    'The API responded with a ',
    response.status,
    (response.statusText) ? ' (' + response.statusText + ') ' : '',
    ' error.'
  ].join('');
}

function parseFetchErrorText(text, response) {
  let json;
  try {
    json = JSON.parse(text);
  } catch (err) {
    Ember.Logger.warn(err);
    json = {
      "errors": [{
        "status": response.status,
        "detail": text
      }]
    };
  }
  json = json || {};
  json.status = response.status;
  return json;
}

function parseXhrErrorResponse(jqXHR, errorThrown) {
  let json = jqXHR.responseJSON;
  if (!json) {
    try {
      if (jqXHR.responseText) {
        json = JSON.parse(jqXHR.responseText);
      }
    } catch(err) {
      Ember.Logger.warn(err);
    }
  }
  json = json || {};
  json.status = jqXHR.status;
  json.errors = json.errors || [{
    status: jqXHR.status,
    detail: jqXHR.responseText,
    message: errorThrown
  }];
  return json;
}
