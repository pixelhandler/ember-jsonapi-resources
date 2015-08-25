/**
  @module ember-jsonapi-resources
  @submodule utils
**/

import Ember from 'ember';
import { isBlank, isDasherized, isType } from 'ember-jsonapi-resources/utils/is';

/**
  Utility helper to setup a computed property for a resource attribute, imported and
  exported with the resource submodule.

  An `attr` of the resource is a computed property to the actual attribute in an
  `attributes` hash on the `resource` (model) instance. Using `attr()` supports
  any type, and an optional `type` (String) argument can be used to enforce
  setting and getting with a specific type. `'string'`, `'number'`, `'boolean'`,
  `'date'`, `'object'`, and `'array'` are all valid types for attributes.

  Use `attr()`, with optional type argument, to compose your model attributes, e.g:

  ```js
  import Ember from 'ember';
  import Resource from 'ember-jsonapi-resources/models/resource';
  import { attr, hasOne, hasMany } from 'ember-jsonapi-resources/models/resource';

  export default Resource.extend({
    type: 'articles',
    service: Ember.inject.service('articles'),

    title: attr('string'),
    published: attr('date'),
    tags: attr('array'),
    footnotes: attr('object'),
    revisions: attr()
    version: attr('number'),
    "is-approved": attr('boolean')
  });
  ```

  @method attr
  @param {String} [type] an optional param for the type of property, i.e. `string`,
    `number`, `boolean`, `date`, `object`, or `array`
  @param {Boolean} [mutable=true] optional param, defaults to `true` if not passed
*/
export default function attr(type = 'any', mutable = true) {
  const _mutable = mutable;
  if (type !== 'any' && !isBlank(type)) {
    assertValidTypeOption(type);
  }
  return Ember.computed('attributes', {
    get: function (key) {
      assertDasherizedAttr(key);
      let value = this.get('attributes.' + key);
      if (!isBlank(value)) {
        assertType.call(this, key, value);
      }
      return value;
    },

    set: function (key, value) {
      const lastValue = this.get('attributes.' + key);
      if (!_mutable) {
        return immutableValue(key, value, lastValue);
      }
      if (value === lastValue) { return value; }
      assertType.call(this, key, value);
      this.set('attributes.' + key, value);
      if (!this.get('isNew')) {
        this._attributes[key] = this._attributes[key] || {};
        this._attributes[key].changed = value;
        this._attributes[key].previous = lastValue;
        const service = this.get('service');
        if (service) {
          service.trigger('attributeChanged', this);
        }
      }
      return this.get('attributes.' + key);
    }
  }).meta({type: type, mutable: mutable});
}

function assertValidTypeOption(type) {
  if (type === 'any') { return; }
  let allowed = 'string number boolean date object array';
  let msg = 'Allowed types are: ' + allowed + ' however ' + type + ' was given instead.';
  Ember.assert(msg, allowed.split(' ').indexOf(type) > -1);
}

function assertDasherizedAttr(name) {
  try {
    let attrName = Ember.String.dasherize(name);
    let msg = "Attributes are recommended to use dasherized names, e.g `'"+ attrName +"': attr()`";
    msg += ", instead of `"+ name +": attr()`";
    Ember.assert(msg, isDasherized(name));
  } catch(e) {
    Ember.Logger.warn(e.message);
  }
}

function assertType(key, value) {
  let meta = this.constructor.metaForProperty(key);
  if (meta && meta.type && meta.type !== 'any') {
    let msg = this.toString() + '#' + key + ' is expected to be a ' + meta.type;
    Ember.assert(msg, isType(meta.type, value));
  }
}

function immutableValue(key, value, lastValue) {
  let msg = [
    this.toString(), '#', key, ' is not mutable set was called with ',
    '`', value, '`', ' but is previous set to `', lastValue, '`'
  ];
  Ember.Logger.warn(msg.join(''));
  return lastValue;
}
