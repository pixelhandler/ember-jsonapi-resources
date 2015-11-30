export function initialize() {
  let application = arguments[1] || arguments[0];

  application.inject('service:store', 'posts', 'service:posts');
  application.inject('service:posts', 'serializer', 'serializer:post');
}

export default {
  name: 'posts-service',
  after: 'store',
  initialize: initialize
};
