import ApplicationAdapter from './application';
import AuthorizationMixin from '../mixins/authorization';

export default ApplicationAdapter.extend(AuthorizationMixin, {
  type: 'post'
});
