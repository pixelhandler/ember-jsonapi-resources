/**
  @module ember-jsonapi-resources
  @submodule transforms
**/

import Ember from 'ember';
import { dateTransform } from 'ember-jsonapi-resources/utils/transforms';

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
