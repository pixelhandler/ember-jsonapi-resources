export function initialize() {
  let application = arguments[1] || arguments[0];

  application.inject('service:store', 'pictures', 'service:pictures');
  application.inject('service:pictures', 'serializer', 'serializer:picture');
}

export default {
  name: 'pictures-service',
  after: 'store',
  initialize: initialize
};
