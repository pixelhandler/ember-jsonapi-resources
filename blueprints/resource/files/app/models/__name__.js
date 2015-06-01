import Resource from '<% packageName %>/models/resource';
import { attr, hasOne, hasMany, hasRelated } from '<% packageName %>/models/resource';

export default Resource.extend({
  type: '<%= entity %>'

  /*
  title: attr(),
  date: attr(),

  relationships: hasRelated('author', 'comments'),
  author: hasOne('author'),
  comments: hasMany('comments')
  */
});
