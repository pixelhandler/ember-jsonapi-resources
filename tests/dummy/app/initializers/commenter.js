export function initialize() {
  let application = arguments[1] || arguments[0];

  application.inject('service:store', 'commenters', 'service:commenters');
  application.inject('service:commenters', 'serializer', 'serializer:commenter');
}

export default {
  name: 'commenters-service',
  after: 'store',
  initialize: initialize
};
