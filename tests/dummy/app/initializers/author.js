import Service from '../services/authors';
import Model from '../models/author';
import Adapter from '../adapters/author';
import Serializer from '../serializers/author';

export function initialize(container, application) {
  const adapter = 'service:authors-adapter';
  const serializer = 'service:authors-serializer';
  const service = 'service:authors';
  const model = 'model:authors';

  application.register(model, Model, { instantiate: false, singleton: false });
  application.register(service, Service);
  application.register(adapter, Adapter);
  application.register(serializer, Serializer);

  application.inject('service:store', 'authors', service);
  application.inject(service, 'serializer', serializer);
}

export default {
  name: 'authors-service',
  after: 'store',
  initialize: initialize
};
