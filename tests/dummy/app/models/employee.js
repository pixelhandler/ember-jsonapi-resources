import PersonResource from './person';
import { toOne, toMany } from 'ember-jsonapi-resources/models/resource';

export default PersonResource.extend({
  type: 'employees',
  pictures: toMany('pictures'),
  supervisor: toOne('supervisor')
});
