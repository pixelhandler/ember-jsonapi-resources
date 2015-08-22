import Service from '../services/pictures';
import Model from '../models/picture';
import Adapter from '../adapters/picture';
import Serializer from '../serializers/picture';

export function initialize(container, application) {
  application.register('model:pictures', Model, { instantiate: false, singleton: false });
  application.register('service:pictures', Service);
  application.register('adapter:pictures', Adapter);
  application.register('serializer:pictures', Serializer);

  application.inject('service:store', 'pictures', 'service:pictures');
  application.inject('service:pictures', 'serializer', 'serializer:pictures');
}

export default {
  name: 'pictures-service',
  after: 'store',
  initialize: initialize
};
