import Service from '../services/authors';
import Model from '../models/author';
import Adapter from '../adapters/author';
import Serializer from '../serializers/author';

export function initialize() {
  let application = arguments[1] || arguments[0];
  application.register('model:authors', Model, { instantiate: false, singleton: false });
  application.register('service:authors', Service);
  application.register('adapter:authors', Adapter);
  application.register('serializer:authors', Serializer);

  application.inject('service:store', 'authors', 'service:authors');
  application.inject('service:authors', 'serializer', 'serializer:authors');
}

export default {
  name: 'authors-service',
  after: 'store',
  initialize: initialize
};
