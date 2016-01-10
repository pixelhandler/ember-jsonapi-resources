export function initialize() {
  let application = arguments[1] || arguments[0];
  application.inject('service:store', 'imageables', 'service:imageables');
  application.inject('service:imageables', 'serializer', 'serializer:imageable');
}

export default {
  name: 'imageables-service',
  after: 'store',
  initialize: initialize
};
