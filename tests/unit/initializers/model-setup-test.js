import Ember from 'ember';
import initializer from '../../../initializers/model-setup';
import { module, test } from 'qunit';

let application, registeredTypeOptions;

module('Unit | Initializer | model-setup', {
  beforeEach() {
    Ember.run(function() {
      application = Ember.Application.create();
      application.deferReadiness();
      stub(application);
    });
  },
  afterEach() {
    application = null;
    registeredTypeOptions = null;
  }
});

test('registers intantiate:false option for model factories', function(assert) {
  initializer.initialize(application);
  let option = registeredTypeOptions.findBy('name', 'model');
  assert.equal(option.name, 'model', 'option for model registered');
  assert.equal(option.options.instantiate, false, 'option set to "instantiate:false"');
});

function stub(app) {
  registeredTypeOptions = Ember.A([]);
  app.registerOptionsForType = function(name, options) {
    registeredTypeOptions.pushObject({name: name, options: options});
  };
}
