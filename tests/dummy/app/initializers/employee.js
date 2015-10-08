import Service from '../services/employees';
import Model from '../models/employee';
import Adapter from '../adapters/employee';
import Serializer from '../serializers/employee';

export function initialize() {
  let application = arguments[1] || arguments[0];
  application.register('model:employees', Model, { instantiate: false, singleton: false });
  application.register('service:employees', Service);
  application.register('adapter:employees', Adapter);
  application.register('serializer:employees', Serializer);

  application.inject('service:store', 'employees', 'service:employees');
  application.inject('service:employees', 'serializer', 'serializer:employees');
}

export default {
  name: 'employees-service',
  after: 'store',
  initialize: initialize
};
