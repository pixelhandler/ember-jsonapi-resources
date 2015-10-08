import Service from '../services/pictures';
import Model from '../models/picture';
import Adapter from '../adapters/picture';
import Serializer from '../serializers/picture';

export function initialize() {
  let application = arguments[1] || arguments[0];
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
