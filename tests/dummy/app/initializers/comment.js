export function initialize() {
  let application = arguments[1] || arguments[0];

  application.inject('service:store', 'comments', 'service:comments');
  application.inject('service:comments', 'serializer', 'serializer:comment');
}

export default {
  name: 'comments-service',
  after: 'store',
  initialize: initialize
};
