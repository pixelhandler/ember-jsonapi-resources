import EmployeeResource from './person';
import { toMany } from 'ember-jsonapi-resources/models/resource';

export default EmployeeResource.extend({
  type: 'supervisors',
  directReports: toMany({resource: 'direct-reports', type: 'employees'})
});
