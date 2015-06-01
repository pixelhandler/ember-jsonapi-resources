import Resource from 'ember-jsonapi-resources/models/resource';
import { attr /*, hasOne, hasMany, hasRelated*/ } from 'ember-jsonapi-resources/models/resource';

export default Resource.extend({
  type: 'post',

  title: attr(),
  date: attr(),

  /*
  relationships: hasRelated('author', 'comments'),
  author: hasOne('author'),
  comments: hasMany('comments')
  */
});
