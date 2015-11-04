import TransformMap from 'ember-jsonapi-resources/utils/transform-map';
import { module, test } from 'qunit';

module('Unit | Utility | transform map');

const map = Object.create(null);
map.yes = 'Yes';
map.no = 'No';
Object.freeze(map);

test('#values', function(assert) {
  let subject = new TransformMap(map);
  assert.equal(subject.values[0], 'Yes', 'map value[0] is "Yes"');
  assert.equal(subject.values[1], 'No', 'map value[1] is "No"');
});

test('#lookup by key', function(assert) {
  let subject = new TransformMap(map);
  assert.equal(subject.lookup('yes'), 'Yes', 'lookup "yes" value is "Yes"');
  assert.equal(subject.lookup('no', 'keys'), 'No', 'lookup "no" value is "No"');
});

test('#lookup by value', function(assert) {
  let subject = new TransformMap(map);
  assert.equal(subject.lookup('Yes', 'values'), 'yes', 'lookup "Yes" value is "yes"');
  assert.equal(subject.lookup('No', 'values'), 'no', 'lookup "No" value is "no"');
});

test('#lookup null', function(assert) {
  let subject = new TransformMap(map);
  assert.equal(subject.lookup(null), null, 'lookup null value is null');
});

test('#values', function(assert) {
  let subject = new TransformMap(map);
  assert.equal(subject.values.toString(), "Yes,No", 'values are "Yes,No"');
});

test('#keys', function(assert) {
  let subject = new TransformMap(map);
  assert.equal(subject.keys.toString(), "yes,no", 'keys are "yes,no"');
});

test('#entries', function(assert) {
  let subject = new TransformMap(map);
  assert.equal(subject.entries[0].toString(), "yes,Yes", 'first entry is `["yes", "Yes"]`');
  assert.equal(subject.entries[1].toString(), "no,No", 'last entry is `["no", "No"]`');
});
