import Resource from 'ember-jsonapi-resources/models/resource';
import { attr, hasOne, hasMany } from 'ember-jsonapi-resources/models/resource';

export default Resource.extend({
  type: '<%= entity %>'

  /*
  title: attr(),
  date: attr(),

  author: hasOne('author'),
  comments: hasMany('comments')
  */
});
