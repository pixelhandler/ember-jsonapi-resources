/**
  @module ember-jsonapi-resources
  @submodule utils
  @main toMany
**/

import Ember from 'ember';
import RelatedProxyUtil from 'ember-jsonapi-resources/utils/related-proxy';
import { linksPath } from 'ember-jsonapi-resources/utils/related-proxy';
import { isDasherized } from 'ember-jsonapi-resources/utils/is';

/**
  Helper to setup a has many relationship to another resource

  ```js
  let Author = Resource.extend({
    type: 'authors',
    name: attr(),
    posts: toMany('posts')
  });
  ```

  Or, with an optional type to use instead of the resource's service

  ```js
  let Person = Resource.extend({
    type: 'people',
    name: attr()
  });

  let Supervisor = Person.extend({
    type: 'supervisors',
    directReports: toMany({ resource: 'employees', type: 'people' })
  });
  ```

  @method toMany
  @for Resource
  @final
  @param {String|Object} relation the name of the relationship
  @param {String} relation.resource the name of the relationship
  @param {String} relation.type the name of the type or service to use
  @return {Object} computed property
*/
export function toMany(relation) {
  let type = relation;
  if (typeof type === 'object') {
    assertResourceAndTypeProps(relation);
    type = relation.type;
    relation = relation.resource;
  }
  assertDasherizedHasManyRelation(relation);
  let kind = 'toMany';
  let util = RelatedProxyUtil.create({'relationship': relation, 'type': type, kind: kind});
  let path = linksPath(relation);
  return Ember.computed(path, function () {
    return util.createProxy(this, kind);
  }).meta({relation: relation, type: type, kind: kind});
}

export let hasMany = toMany;

function assertResourceAndTypeProps(relation) {
  try {
    let msg = 'Options must include properties: resource, type';
    Ember.assert(msg, relation && relation.resource && relation.type);
  } catch(e) {
    Ember.Logger.warn(e.message);
  }
}

function assertDasherizedHasManyRelation(name) {
  try {
    let relationName = Ember.String.dasherize(name);
    let msg = " are recommended to use dasherized names, e.g `toMany('"+ relationName +"')`";
    msg += ", instead of `toMany('"+ name +"')`";
    Ember.assert(msg, isDasherized(name));
  } catch(e) {
    Ember.Logger.warn(e.message);
  }
}
