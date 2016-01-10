import Post from '../models/post';

export function initialize() {
  let application = arguments[1] || arguments[0];
  application.register('model:post', Post, { instantiate: false, singleton: false });
  application.inject('service:store', 'posts', 'service:posts');
  application.inject('service:posts', 'serializer', 'serializer:post');
}

export default {
  name: 'posts-service',
  after: 'store',
  initialize: initialize
};
