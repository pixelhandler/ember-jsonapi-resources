import Product from '../models/product';

export function initialize() {
  let application = arguments[1] || arguments[0];
  application.register('model:product', Product, { instantiate: false, singleton: false });
  application.inject('service:store', 'products', 'service:products');
  application.inject('service:products', 'serializer', 'serializer:product');
}

export default {
  name: 'products-service',
  after: 'store',
  initialize: initialize
};
