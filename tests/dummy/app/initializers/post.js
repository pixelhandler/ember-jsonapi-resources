import Service from '../services/posts';
import Model from '../models/post';
import Adapter from '../adapters/post';
import Serializer from '../serializers/post';

export function initialize() {
  let application = arguments[1] || arguments[0];
  application.register('model:posts', Model, { instantiate: false, singleton: false });
  application.register('service:posts', Service);
  application.register('adapter:posts', Adapter);
  application.register('serializer:posts', Serializer);

  application.inject('service:store', 'posts', 'service:posts');
  application.inject('service:posts', 'serializer', 'serializer:posts');
}

export default {
  name: 'posts-service',
  after: 'store',
  initialize: initialize
};
