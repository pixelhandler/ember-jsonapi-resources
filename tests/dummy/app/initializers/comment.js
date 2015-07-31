import Service from '../services/comments';
import Model from '../models/comment';
import Adapter from '../adapters/comment';
import Serializer from '../serializers/comment';

export function initialize(container, application) {
  application.register('model:comments', Model, { instantiate: false, singleton: false });
  application.register('service:comments', Service);
  application.register('adapter:comments', Adapter);
  application.register('serializer:comments', Serializer);

  application.inject('service:store', 'comments', 'service:comments');
  application.inject('service:comments', 'serializer', 'serializer:comments');
}

export default {
  name: 'comments-service',
  after: 'store',
  initialize: initialize
};
