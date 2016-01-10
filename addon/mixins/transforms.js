/**
  @module ember-jsonapi-resources
  @submodule transforms
**/

import Ember from 'ember';
import { dateTransform } from 'ember-jsonapi-resources/utils/transforms';

/**
  A Mixin class for methods to transform resource attributes, includes date
  attribute methods to serialize and deserialize the date(time) to/from
  ISO Format for use with `attr('date')`

  Any valid attribute type (string, boolean, number, object, array, date) can
  be added to your app, just generate a transforms mixin and define other
  types if needed, and use the type when defining a resource attribute,
  e.g. attr('array')

  @class TransformsMixin
  @static
*/
export default Ember.Mixin.create({
  /**
    @method serializeDateAttribute
    @param {Date|String} date
    @return {String|Null} date value as ISO String for JSON payload, or null
  */
  serializeDateAttribute(date) {
    return dateTransform.serialize(date);
  },

  /**
    @method deserializeDateAttribute
    @param {String} date usually in ISO format, must be a valid argument for Date
    @return {Date|Null} date value from JSON payload, or null
  */
  deserializeDateAttribute(date) {
    return dateTransform.deserialize(date);
  }
});
