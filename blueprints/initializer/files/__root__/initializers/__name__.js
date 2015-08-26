import Service from '../services/<%= resource %>';
import Model from '../models/<%= entity %>';
import Adapter from '../adapters/<%= entity %>';
import Serializer from '../serializers/<%= entity %>';

export function initialize(registry, application) {
  application.register('model:<%= resource %>', Model, { instantiate: false, singleton: false });
  application.register('service:<%= resource %>', Service);
  application.register('adapter:<%= resource %>', Adapter);
  application.register('serializer:<%= resource %>', Serializer);

  application.inject('service:store', '<%= resource %>', 'service:<%= resource %>');
  application.inject('service:<%= resource %>', 'serializer', 'serializer:<%= resource %>');
}

export default {
  name: '<%= resource %>-service',
  after: 'store',
  initialize: initialize
};
