import Service from '../services/comments';
import Model from '../models/comment';
import Adapter from '../adapters/comment';
import Serializer from '../serializers/comment';

export function initialize(container, application) {
  const adapter = 'service:comments-adapter';
  const serializer = 'service:comments-serializer';
  const service = 'service:comments';
  const model = 'model:comments';

  application.register(model, Model, { instantiate: false, singleton: false });
  application.register(service, Service);
  application.register(adapter, Adapter);
  application.register(serializer, Serializer);

  application.inject('service:store', 'comments', service);
  application.inject(service, 'serializer', serializer);
}

export default {
  name: 'comments-service',
  after: 'store',
  initialize: initialize
};
