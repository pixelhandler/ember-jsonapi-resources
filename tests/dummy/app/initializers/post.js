import Service from '../services/posts';
import Model from '../models/post';
import Adapter from '../adapters/post';
import Serializer from '../serializers/post';

export function initialize(container, application) {
  const adapter = 'service:posts-adapter';
  const serializer = 'service:posts-serializer';
  const service = 'service:posts';
  const model = 'model:posts';

  application.register(model, Model, { instantiate: false });
  application.register(service, Service);
  application.register(adapter, Adapter);
  application.register(serializer, Serializer);

  //application.inject('route', 'posts', service);
  application.inject(model, 'service', service);
  application.inject('service:store', 'posts', service);
  application.inject(service, 'serializer', serializer);
}

export default {
  name: 'posts-service',
  after: 'store',
  initialize: initialize
};
