export function initialize() {
  let application = arguments[1] || arguments[0];

  application.inject('service:store', 'authors', 'service:authors');
  application.inject('service:authors', 'serializer', 'serializer:author');
}

export default {
  name: 'authors-service',
  after: 'store',
  initialize: initialize
};
