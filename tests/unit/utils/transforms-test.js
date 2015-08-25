import { dateTransform } from 'ember-jsonapi-resources/utils/transforms';
import { module, test } from 'qunit';

module('Unit | Utility | transforms');

test('dateTransform#serialize - to ISO String', function(assert) {
  let date = 'October 26, 1881';
  let gunfightAtOKCorral = new Date(date);
  let expected = gunfightAtOKCorral.toISOString();
  let serialized = dateTransform.serialize(gunfightAtOKCorral);
  assert.equal(serialized, expected, 'serialized to ISO String');
});

test('dateTransform#deserialize - from ISO String', function(assert) {
  let date = 'October 26, 1881';
  let gunfightAtOKCorral = new Date(date);
  let value = gunfightAtOKCorral.toISOString();
  let deserialized = dateTransform.deserialize(value);
  assert.equal(deserialized.valueOf(), gunfightAtOKCorral.valueOf(), 'deserialized from ISO String');
});
