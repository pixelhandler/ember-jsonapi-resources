import EmployeeResource from './person';
import { hasMany } from 'ember-jsonapi-resources/models/resource';

export default EmployeeResource.extend({
  type: 'supervisors',
  directReports: hasMany('employees')
});
