/**
  @module ember-jsonapi-resources
  @submodule utils
**/

import Ember from 'ember';

export function isBlank(value) {
  return value === null || typeof value === 'undefined';
}

export function isDasherized(name) {
  return (Ember.String.dasherize(name) === name);
}

export function isType(type, value) {
  type = Ember.String.capitalize(type);
  type = `[object ${type}]`;
  return Object.prototype.toString.call(value) === type;
}
