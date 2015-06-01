import Service from '../services/<%= resource %>';
import Model from '../models/<%= entity %>';
import Adapter from '../adapters/<%= entity %>';
import Serializer from '../serializers/<%= entity %>';

export function initialize(container, application) {
  const adapter = 'service:<%= resource %>-adapter';
  const serializer = 'service:<%= resource %>-serializer';
  const service = 'service:<%= resource %>';
  const model = 'model:<%= resource %>';

  application.register(model, Model, { instantiate: false });
  application.register(service, Service);
  application.register(adapter, Adapter);
  application.register(serializer, Serializer);

  //application.inject('route', '<%= resource %>', service);
  application.inject(model, 'service', service);
  application.inject('service:store', '<%= resource %>', service);
  application.inject(service, 'serializer', serializer);
}

export default {
  name: '<%= resource %>-service',
  after: 'store',
  initialize: initialize
};
