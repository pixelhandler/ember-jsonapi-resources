import attr from 'ember-jsonapi-resources/utils/attr';
import { module, test } from 'qunit';
import Ember from 'ember';

let Resource = Ember.Object.extend({ attributes: {}, _attributes: {} });

module('Unit | Utility | attr');

test('attr("string") setting with a string', function(assert) {
  let Person = Resource.extend({
    name: attr('string')
  });
  let person = Person.create();
  person.set('name', 'Wyatt Earp');
  assert.equal(person.get('name'), 'Wyatt Earp', 'person name is set with a string');
});

test('attr("string") getting a string', function(assert) {
  let Person = Resource.extend({
    name: attr('string')
  });
  let person = Person.create({ attributes: { name: 'Wyatt Earp'} });
  assert.equal(person.get('name'), 'Wyatt Earp', 'person.get("name") is a string');
});

test('using attr("string") throws an assertion error when setting with another type', function(assert) {
  let Person = Resource.extend({
    name: attr('string')
  });
  let person = Person.create();
  assert.throws(function() {
    person.set('name', false);
  }, 'Setting name to `false` throws an assertion error');
});

test('using attr("string") throws an assertion error when getting with another type', function(assert) {
  let Person = Resource.extend({
    name: attr('string')
  });
  let person = Person.create({ attributes: { name: false} });
  assert.throws(function() {
    person.get('name');
  }, 'Getting name already set with `false` value throws an assertion error');
});

test('attr("boolean" setting a boolean)', function(assert) {
  let Person = Resource.extend({
    isCowboy: attr('boolean')
  });
  let person = Person.create();
  person.set('isCowboy', true);
  assert.equal(person.get('isCowboy'), true, 'person set with a boolean attribute');
});

test('attr("boolean" getting a boolean)', function(assert) {
  let Person = Resource.extend({
    isCowboy: attr('boolean')
  });
  let person = Person.create({ attributes: {'isCowboy': true} });
  assert.equal(person.get('isCowboy'), true, 'person.get("isCowboy") is a boolean attribute');
});

test('using attr("boolean") throws an assertion error when setting with another type', function(assert) {
  let Person = Resource.extend({
    isCowboy: attr('boolean')
  });
  let person = Person.create();
  assert.throws(function() {
    person.set('isCowboy', 'yep');
  }, 'Setting isCowboy to `"yep"` throws an assertion error');
});

test('using attr("boolean") throws an assertion error when getting with another type', function(assert) {
  let Person = Resource.extend({
    isCowboy: attr('boolean')
  });
  let person = Person.create({ attributes: {'isCowboy': 'yep'} });
  assert.throws(function() {
    person.get('isCowboy');
  }, 'Getting isCowboy already set with a `"yep"` throws an assertion error');
});

test('attr("number") setting a number', function(assert) {
  let Person = Resource.extend({
    birthYear: attr('number')
  });
  let person = Person.create();
  person.set('birthYear', 1848);
  assert.equal(person.get('birthYear'), 1848, 'person set with a number attribute');
});

test('attr("number") getting a number', function(assert) {
  let Person = Resource.extend({
    birthYear: attr('number')
  });
  let person = Person.create({ attributes: {'birthYear': 1848} });
  assert.equal(person.get('birthYear'), 1848, 'person.get("birthYear") is a number');
});

test('using attr("number") throws an assertion error when setting with another type', function(assert) {
  let Person = Resource.extend({
    birthYear: attr('number')
  });
  let person = Person.create();
  assert.throws(function() {
    person.set('birthYear', '1848');
  }, 'Setting birthYear to `"1848"` throws an assertion error');
});

test('using attr("number") throws an assertion error when getting with another type', function(assert) {
  let Person = Resource.extend({
    birthYear: attr('number')
  });
  let person = Person.create({ attributes: {'birthYear': '1848'} });
  assert.throws(function() {
    person.get('birthYear');
  }, 'Getting birthYear already set to `"1848"` throws an assertion error');
});

test('attr("date") setting with a date type', function(assert) {
  let Person = Resource.extend({
    birthdate: attr('date')
  });
  let person = Person.create();
  let birthdate = new Date('March 19, 1848');
  person.set('birthdate', birthdate);
  assert.equal(person.get('birthdate'), birthdate, 'person set with a date attribute');
});

test('attr("date") getting a date type', function(assert) {
  let Person = Resource.extend({
    birthdate: attr('date')
  });
  let birthdate = new Date('March 19, 1848');
  let person = Person.create({ attributes: {'birthdate': birthdate} });
  assert.equal(person.get('birthdate'), birthdate, 'person set with a date attribute');
});

test('using attr("date") throws an assertion error when setting with another type', function(assert) {
  let Person = Resource.extend({
    birthdate: attr('date')
  });
  let person = Person.create();

  assert.throws(function() {
    person.set('birthdate', 'March 19, 1848');
  }, 'Setting birthdate to `"March 19, 1848"` throws an assertion error');
});

test('using attr("date") throws an assertion error when getting with another type', function(assert) {
  let Person = Resource.extend({
    birthdate: attr('date')
  });
  let person = Person.create({ attributes: {'birthdate': 'March 19, 1848'} });

  assert.throws(function() {
    person.qet('birthdate');
  }, 'Getting birthdate already set to `"March 19, 1848"` throws an assertion error');
});

test('attr("object") setting a object', function(assert) {
  let Person = Resource.extend({
    lifespan: attr('object')
  });
  let person = Person.create();
  let lifespan = { birth: 'March 19, 1848', death: 'January 13, 1929', aged: 80 };
  person.set('lifespan', lifespan);
  assert.deepEqual(person.get('lifespan'), lifespan, 'person set with a object attribute');
});

test('attr("object") getting an object', function(assert) {
  let Person = Resource.extend({
    lifespan: attr('object')
  });
  let lifespan = { birth: 'March 19, 1848', death: 'January 13, 1929', aged: 80 };
  let person = Person.create({ attributes: {'lifespan': lifespan} });
  assert.deepEqual(person.get('lifespan'), lifespan, 'person.get("lifespan") is a object attribute');
});

test('using attr("object") throws an assertion error when setting with another type', function(assert) {
  let Person = Resource.extend({
    lifespan: attr('object')
  });
  let person = Person.create();
  assert.throws(function() {
    person.set('lifespan', 'aged: 80');
  }, 'Setting lifespan to `"aged: 80"` throws an assertion error');
});

test('using attr("object") throws an assertion error when getting with another type', function(assert) {
  let Person = Resource.extend({
    lifespan: attr('object')
  });
  let person = Person.create({ attributes: { lifespan: ['March 19, 1848', 'January 13, 1929', 80 ]} });
  assert.throws(function() {
    person.get('lifespan');
  }, 'Getting lifespan already set to an array throws an assertion error');
});

test('attr("array") setting an array type', function(assert) {
  let Person = Resource.extend({
    relatives: attr('array')
  });
  let person = Person.create();
  let relatives = 'Virgil, James, Morgan, Warren'.split(', ');
  person.set('relatives', relatives);
  assert.deepEqual(person.get('relatives'), relatives, 'person set with an array attribute');
});

test('attr("array") getting an array type', function(assert) {
  let Person = Resource.extend({
    relatives: attr('array')
  });
  let relatives = 'Virgil, James, Morgan, Warren'.split(', ');
  let person = Person.create({ attributes: {relatives: relatives} });
  assert.deepEqual(person.get('relatives'), relatives, 'person.get("relatives") is an array');
});

test('using attr("array") throws an assertion error when setting with another type', function(assert) {
  let Person = Resource.extend({
    relatives: attr('array')
  });
  let person = Person.create();
  assert.throws(function() {
    person.set('relatives', 'Virgil, James, Morgan, Warren');
  }, 'Setting relatives to `"Virgil, James, Morgan, Warren"` throws an assertion error');
});

test('using attr("array") throws an assertion error when getting with another type', function(assert) {
  let Person = Resource.extend({
    relatives: attr('array')
  });
  let relatives = 'Virgil, James, Morgan, Warren';
  let person = Person.create({ attributes: {relatives: relatives} });
  assert.throws(function() {
    person.get('relatives');
  }, 'Getting relatives when already set to `"' + relatives + '"` throws an assertion error');
});

test('attr() default is any type, works with a string', function(assert) {
  let Thing = Resource.extend({
    misc: attr()
  });
  let thing = Thing.create();
  thing.set('misc', 'string');
  assert.equal(thing.get('misc'), 'string', 'thing set with a string attribute');
  thing = Thing.create({ attributes: {misc: 'string'} });
  assert.equal(thing.get('misc'), 'string', 'thing.get("misc") is a string');
});

test('attr() default is any type, works with a number', function(assert) {
  let Thing = Resource.extend({
    misc: attr()
  });
  let thing = Thing.create();
  thing.set('misc', 101);
  assert.equal(thing.get('misc'), 101, 'thing set with a number attribute');
  thing = Thing.create({ attributes: {misc: 101} });
  assert.equal(thing.get('misc'), 101, 'thing.get("misc") is a number');
});

test('attr() default is any type, works with a date', function(assert) {
  let Thing = Resource.extend({
    misc: attr()
  });
  let thing = Thing.create();
  let date = new Date('March 19, 1848');
  thing.set('misc', date);
  assert.equal(thing.get('misc'), date, 'thing set with a date attribute');
  thing = Thing.create({ attributes: {misc: date} });
  assert.equal(thing.get('misc'), date, 'thing.get("misc") is a date');
});

test('attr() default is any type, works with an object', function(assert) {
  let Thing = Resource.extend({
    misc: attr()
  });
  let thing = Thing.create();
  let obj = {number: 42};
  thing.set('misc', obj);
  assert.deepEqual(thing.get('misc'), obj, 'thing set with an object attribute');
  thing = Thing.create({ attributes: {misc: obj} });
  assert.equal(thing.get('misc'), obj, 'thing.get("misc") is an object');
});

test('attr() default is any type, works with an array', function(assert) {
  let Thing = Resource.extend({
    misc: attr()
  });
  let thing = Thing.create();
  let arr = 'Virgil, James, Morgan, Warren'.split(', ');
  thing.set('misc', arr);
  assert.deepEqual(thing.get('misc'), arr, 'thing set with a array attribute');
  thing = Thing.create({ attributes: {misc: arr} });
  assert.equal(thing.get('misc'), arr, 'thing.get("misc") is an array');
});
