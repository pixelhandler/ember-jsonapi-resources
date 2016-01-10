import Comment from '../models/comment';

export function initialize() {
  let application = arguments[1] || arguments[0];
  application.register('model:comment', Comment, { instantiate: false, singleton: false });
  application.inject('service:store', 'comments', 'service:comments');
  application.inject('service:comments', 'serializer', 'serializer:comment');
}

export default {
  name: 'comments-service',
  after: 'store',
  initialize: initialize
};
