import PersonResource from './person';
import { hasOne, hasMany } from 'ember-jsonapi-resources/models/resource';

export default PersonResource.extend({
  type: 'employees',
  pictures: hasMany('pictures'),
  supervisor: hasOne({resource: 'supervisor', type: 'employees'})
});
