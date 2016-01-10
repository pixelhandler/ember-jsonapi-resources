/**
  @module ember-jsonapi-resources
  @submodule utils
**/

import Ember from 'ember';

/**
  @method isBlank
  @param {String} value
  @return {Boolean}
*/
export function isBlank(value) {
  return value === null || typeof value === 'undefined';
}

/**
  @method isDasherized
  @param {String} name
  @return {Boolean}
*/
export function isDasherized(name) {
  return (Ember.String.dasherize(name) === name);
}

/**
  @method isType
  @param {String} type - e.g. string, date, error, boolean, etc.
  @param {Object} value - object to test the type
  @return {Boolean}
*/
export function isType(type, value) {
  type = Ember.String.capitalize(type);
  type = `[object ${type}]`;
  return Object.prototype.toString.call(value) === type;
}
