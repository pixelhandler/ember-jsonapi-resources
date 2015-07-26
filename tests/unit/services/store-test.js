import { moduleFor, test } from 'ember-qunit';
import Ember from 'ember';
import { pluralize } from 'ember-inflector';

let methods = Ember.String.w('find createResource updateResource patchRelationship deleteResource');

let mockServices, entities = ['post', 'author', 'comment'];

const MockService = function (name) {
  methods.forEach(function (method) {
    this[method] = window.sinon.expectation.create(method);
  }.bind(this));
  this.cache = { data: Ember.A([{id: '1', type: name}]) };
  return this;
};

moduleFor('service:store', 'Unit | Service | store', {
  beforeEach() {
    mockServices = {};
    entities.forEach(function (entity) {
      let serviceName = pluralize(entity);
      mockServices[serviceName] = new MockService(serviceName);
    });
  },
  afterEach() {
    entities.forEach(function (entity) {
      let serviceName = pluralize(entity);
      methods.forEach(function(method) {
        mockServices[serviceName][method].reset();
      });
    });
    mockServices = null;
  }
});

function methodTest(methodName, assert) {
  var store = this.subject(mockServices);
  assert.ok(store[methodName], 'service.'+ methodName +' exists');
  entities.forEach(function(entity) {
    let serviceName = pluralize(entity);
    mockServices[serviceName][methodName].once();
    store[methodName](entity);
    let msg = 'verify store.'+ serviceName +'.'+ methodName +' called through store.'+ methodName;
    assert.ok(mockServices[serviceName][methodName].verify(), msg);
  });
}

methods.forEach(function (method) {
  test('#' + method, function(assert) {
    methodTest.call(this, method, assert);
  });
});

test('#all', function (assert) {
  var store = this.subject(mockServices);
  entities.forEach(function (entity) {
    let resources = store.all(entity);
    assert.equal(resources.length, 1, '1 item in the store cache for ' + pluralize(entity));
  });
});

test('singleton service', function (assert) {
  var singletonService = new MockService('me');

  var store = this.subject({ 'me': singletonService });
  store.find('me', { singleton: true, id: '1' });
  assert.ok(singletonService.find.once(), 'singleton service #find called');

  methods.forEach(function(method) {
    singletonService[method].reset();
  });
});
