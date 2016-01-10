/**
  @module ember-jsonapi-resources
  @submodule initializers
**/

/**
  Initializer for the model factories, registers option to not initialize

  @method initialize
  @for Resource
*/
export function initialize(application) {
  if (typeof application.registerOptionsForType === 'function') {
    let options = { instantiate: false, singleton: false };
    application.registerOptionsForType('model', options);
  }
}

export default {
  name: 'model-setup',
  initialize
};
