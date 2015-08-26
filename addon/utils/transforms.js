/**
  @module ember-jsonapi-resources
  @submodule utils
**/

import { isBlank, isType } from 'ember-jsonapi-resources/utils/is';

/**
  @class TransformDateAttribute
*/
class TransformDateAttribute {

  /**
    @method serialize
    @param {Date|String} date
    @return {String|Null} date value as ISO String for JSON payload, or null
  */
  serialize(date) {
    if (isBlank(date) || date === '') {
      date = null;
    } else if (isType('date', date)) {
      date = date.toISOString();
    } else if (isType('string', date)) {
      date = new Date(date);
    }
    return (date) ? date : null;
  }

  /**
    @method deserialize
    @param {String} date usually in ISO format, must be a valid argument for Date
    @return {Date|Null} date value from JSON payload, or null
  */
  deserialize(date) {
    if (isBlank(date)) {
      date = null;
    } else if (isType('string', date) || isType('number', date)) {
      date = new Date(date);
    }
    return (date) ? date : null;
  }

}

export let dateTransform = new TransformDateAttribute();
