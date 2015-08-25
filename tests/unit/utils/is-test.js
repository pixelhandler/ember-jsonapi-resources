import { isBlank, isDasherized, isType } from 'ember-jsonapi-resources/utils/is';
import { module, test } from 'qunit';

module('Unit | Utility | is');

test('#isBlank null, undefined', function(assert) {
  assert.ok(isBlank(null), 'null is blank');
  assert.ok(isBlank(undefined), 'undefined is blank');
});

test('#isBlank primitives: string, number, boolean', function(assert) {
  assert.ok(!isBlank('Wild West'), 'A string (with length) is not blank');
  assert.ok(!isBlank(''), 'A string (with no length) is not blank');

  assert.ok(!isBlank(1848), 'A (postive) number is not blank');
  assert.ok(!isBlank(0), 'A (zero) number is not blank');
  assert.ok(!isBlank(-1), 'A (negative) number is not blank');
  assert.ok(!isBlank(0.25), 'A (float) number is not blank');

  assert.ok(!isBlank(false), 'A (false) boolean is not blank');
  assert.ok(!isBlank(true), 'A (true) boolean is not blank');
});

test('#isBlank complex: date, object, array', function(assert) {
  assert.ok(!isBlank(new Date('1848')), 'A date is not blank');
  assert.ok(!isBlank({}), 'An empty object is not blank');
  assert.ok(!isBlank({name: 'Joe'}), 'An object (with props) is not blank');
  assert.ok(!isBlank(['Sue']), 'An array (with length) is not blank');
});

test('#isDasherized', function(assert) {
  assert.ok(isDasherized('is-dashed'), 'is-dashed is dasherized');
  assert.ok(!isDasherized('camelCased'), 'camelCased is not dasherized');
  assert.ok(!isDasherized('snake_case'), 'snake_case is not dasherized');
});

test('#isType - string', function(assert) {
  assert.ok(isType('string', 'Los Angeles, CA'), 'value is a string');
});

test('#isType - number', function(assert) {
  assert.ok(isType('number', 1901), 'value is a number');
});

test('#isType - boolean', function(assert) {
  assert.ok(isType('boolean', true), 'value is a boolean');
});

test('#isType - date', function(assert) {
  assert.ok(isType('date', new Date('1848')), 'value is a date');
});

test('#isType - object', function(assert) {
  assert.ok(isType('object', {}), 'value is an object');
});

test('#isType - array', function(assert) {
  assert.ok(isType('array', []), 'value is an array');
});
