import Author from '../models/author';

export function initialize() {
  let application = arguments[1] || arguments[0];
  application.register('model:author', Author, { instantiate: false, singleton: false });
  application.inject('service:store', 'authors', 'service:authors');
  application.inject('service:authors', 'serializer', 'serializer:author');
}

export default {
  name: 'authors-service',
  after: 'store',
  initialize: initialize
};
