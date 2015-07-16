import AuthorizationMixin from 'ember-jsonapi-resources/mixins/authorization';
import ApplicationAdapter from 'ember-jsonapi-resources/adapters/application';

/**
  Adapter for a JSON API endpoint, combines the addon ApplicationAdapter and AuthorizationMixin

  @class ApplicationAdapter
  @uses AuthorizationMixin
*/
export default ApplicationAdapter.extend(AuthorizationMixin);
