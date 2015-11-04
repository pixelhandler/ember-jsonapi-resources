/**
  @module utils
  @submodule transform-map
*/
import { isBlank, isType } from './is';

/**
  Abstract class to transform mapped data structures

  @class TransformMap
**/
export default class TransformMap {

  /**
    @method constructor
    @param {Object} [map] created with `null` as prototype
  **/
  constructor(map) {
    this.map = map;
    this.keys = Object.keys(map);
    let inverse = Object.create(null);
    let values = [];
    let entries = [];
    let pair;
    for (let key in map) {
      values.push(map[key]);
      inverse[map[key]] = key;
      pair = Object.create(null);
      entries.push([key, map[key]]);
    }
    Object.freeze(inverse);
    this.values = values;
    this.inverse = inverse;
    this.entries = entries;
  }

  /**
    @method lookup
    @param {String} [value]
    @parm {String} [use='keys'] keys or values
    @return {String|Null} [value] name or null
  */
  lookup(value, use = 'keys') {
    if (isBlank(value) || value === '') {
      value = null;
    } else if (isType('string', value)) {
      if (this[use].indexOf(value) > -1) {
        if (use === 'keys') {
          value = this.map[value];
        } else if (use === 'values') {
          value = this.inverse[value];
        }
      }
    }
    return (value) ? value : null;
  }
}
