import Service from '../services/commenters';
import Model from '../models/commenter';
import Adapter from '../adapters/commenter';
import Serializer from '../serializers/commenter';

export function initialize(container, application) {
  const adapter = 'service:commenters-adapter';
  const serializer = 'service:commenters-serializer';
  const service = 'service:commenters';
  const model = 'model:commenters';

  application.register(model, Model, { instantiate: false, singleton: false });
  application.register(service, Service);
  application.register(adapter, Adapter);
  application.register(serializer, Serializer);

  application.inject('service:store', 'commenters', service);
  application.inject(service, 'serializer', serializer);
}

export default {
  name: 'commenters-service',
  after: 'store',
  initialize: initialize
};
