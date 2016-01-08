/**
  @module ember-jsonapi-resources
  @submodule utils
**/

/**
  @constructor ServerError
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
}
ServerError.prototype = errorProtoFactory(ServerError);

/**
  @constructor ClientError
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
}
ClientError.prototype = errorProtoFactory(ClientError);

/**
  @constructor FetchError
  @param {String} message
  @param {Error} error
  @param {Object} response
  @return {Error}
*/
export function FetchError(message = 'Fetch Error', error = null, response = null) {
  let _error = Error.prototype.constructor.call(this, message);
  _error.name = this.name = 'FetchError';
  this.stack = (error && error.stack) ? error.stack : _error.stack;
  this.message = (error && error.message) ? error.message : _error.message;
  this.name = 'FetchError';
  this.response = response;
  this.error = error || _error;
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
