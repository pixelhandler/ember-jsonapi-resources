import Service from '../services/imageables';
import Adapter from '../adapters/imageable';
import Serializer from '../serializers/application';

export function initialize(container, application) {
  application.register('service:imageables', Service);
  application.register('adapter:imageables', Adapter);
  application.register('serializer:imageables', Serializer);

  application.inject('service:store', 'imageables', 'service:imageables');
  application.inject('service:imageables', 'serializer', 'serializer:imageables');
}

export default {
  name: 'imageables-service',
  after: 'store',
  initialize: initialize
};
