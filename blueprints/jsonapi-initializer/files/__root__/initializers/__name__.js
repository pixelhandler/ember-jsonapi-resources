import Resource from '<%= modelPath %>';

export function initialize() {
  // see http://emberjs.com/deprecations/v2.x/#toc_initializer-arity
  let application = arguments[1] || arguments[0];
  application.register('model:<%= entity %>', Resource, { instantiate: false, singleton: false });
  application.inject('service:store', '<%= resource %>', 'service:<%= resource %>');
  application.inject('service:<%= resource %>', 'serializer', 'serializer:<%= entity %>');
}

export default {
  name: '<%= resource %>-service',
  after: 'store',
  initialize: initialize
};
