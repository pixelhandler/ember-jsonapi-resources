import Service from '../services/commenters';
import Model from '../models/commenter';
import Adapter from '../adapters/commenter';
import Serializer from '../serializers/commenter';

export function initialize(container, application) {
  application.register('model:commenters', Model, { instantiate: false, singleton: false });
  application.register('service:commenters', Service);
  application.register('adapter:commenters', Adapter);
  application.register('serializer:commenters', Serializer);

  application.inject('service:store', 'commenters', 'service:commenters');
  application.inject('service:commenters', 'serializer', 'serializer:commenters');
}

export default {
  name: 'commenters-service',
  after: 'store',
  initialize: initialize
};
