/**
  @module ember-jsonapi-resources
  @submodule utils
**/

/**
  @class ServerError
  @constructor
  @param {String} message
  @param {Object} response
  @return {Error}
*/
export function ServerError(message = 'Server Error', response = null) {
  let _error = Error.prototype.constructor.call(this, message);
  _error.name = this.name = 'ServerError';
  this.stack = _error.stack;
  this.message = _error.message;
  this.name = 'ServerError';
  this.response = response;
  this.errors = (response) ? response.errors || null : null;
  this.code = (response) ? response.status || null : null;
}
ServerError.prototype = errorProtoFactory(ServerError);

/**
  @class ClientError
  @constructor
  @param {String} message
  @param {Object} response
  @return {Error}
*/
export function ClientError(message = 'Client Error', response = null) {
  let _error = Error.prototype.constructor.call(this, message);
  _error.name = this.name = 'ClientError';
  this.stack = _error.stack;
  this.message = _error.message;
  this.name = 'ClientError';
  this.response = response;
  this.errors = (response) ? response.errors || null : null;
  this.code = (response) ? response.status || null : null;
}
ClientError.prototype = errorProtoFactory(ClientError);

/**
  @class FetchError
  @constructor
  @param {String} message
  @param {Error|Object} error or response object
  @return {Error}
*/
export function FetchError(message = 'Fetch Error', response = null) {
  let _error = Error.prototype.constructor.call(this, message);
  _error.name = this.name = 'FetchError';
  this.stack = (response && response.stack) ? response.stack : _error.stack;
  this.message = (response && response.message) ? response.message : _error.message;
  this.name = 'FetchError';
  this.error = (response instanceof Error) ? response : _error;
  this.response = (response instanceof Error) ? null : response;
  this.errors = (this.response) ? response.errors : null;
  this.code = (response) ? response.status || null : null;
}
FetchError.prototype = errorProtoFactory(FetchError);

function errorProtoFactory(ctor) {
  return Object.create(Error.prototype, {
    constructor: {
      value: ctor,
      writable: true,
      configurable: true
    }
  });
}
