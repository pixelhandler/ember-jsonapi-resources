export function initialize() {
  let application = arguments[1] || arguments[0];

  application.inject('service:store', 'employees', 'service:employees');
  application.inject('service:employees', 'serializer', 'serializer:employee');
}

export default {
  name: 'employees-service',
  after: 'store',
  initialize: initialize
};
