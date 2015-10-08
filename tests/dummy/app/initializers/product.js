import Service from '../services/products';
import Model from '../models/product';
import Adapter from '../adapters/product';
import Serializer from '../serializers/product';

export function initialize() {
  let application = arguments[1] || arguments[0];
  application.register('model:products', Model, { instantiate: false, singleton: false });
  application.register('service:products', Service);
  application.register('adapter:products', Adapter);
  application.register('serializer:products', Serializer);

  application.inject('service:store', 'products', 'service:products');
  application.inject('service:products', 'serializer', 'serializer:products');
}

export default {
  name: 'products-service',
  after: 'store',
  initialize: initialize
};
