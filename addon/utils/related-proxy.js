/**
  @module ember-jsonapi-resources
  @submodule utils
  @main RelatedProxyUtil
**/

import Ember from 'ember';
import RSVP from 'rsvp';
import { pluralize } from 'ember-inflector';

/**
  Utility for creating promise proxy objects for related resources

  @class RelatedProxyUtil
  @static
  @final
*/
const RelatedProxyUtil = Ember.Object.extend({

  /**
    Checks for required `relationship` property

    @method init
  */
  init: function () {
    this._super();
    if (typeof this.get('relationship') !== 'string') {
      throw new Error('RelatedProxyUtil#init expects `relationship` property to exist.');
    }
    return this;
  },

  /**
    The name of the relationship

    @property resource
    @type String
    @required
  */
  relationship: null,

  /**
    The name of the type of resource

    @property type
    @type String
    @required
  */
  type: null,

  /**
    Proxy for the requested relation, resolves w/ content from fulfilled promise

    @method createProxy
    @param {Resource} resource
    @param {String} kind 'toMany' or 'toOne'
    @return {PromiseProxy|ObjectProxy|ArrayProxy} proxy instance, new resource uses mock relations
  */
  createProxy(resource, kind) {
    let proxyFactory, newContent;
    if (kind === 'toMany') {
      proxyFactory = Ember.ArrayProxy;
      newContent = Ember.A([]);
    } else if (kind === 'toOne') {
      proxyFactory = Ember.ObjectProxy;
      newContent = Ember.Object.create();
    }
    if (resource.get('isNew')) {
      return proxyFactory.create({ content: newContent });
    } else {
      let proxy = this.proxySetup(resource, kind, proxyFactory);
      return this.proxyResolution(resource, proxy);
    }
  },

  /**
    @method proxySetup
    @param {Resource} resource
    @param {String} kind 'toMany' or 'toOne'
    @param {Ember.ObjectProxy|Ember.ArrayProxy} proxyFactory
    @return {PromiseProxy} proxy
  */
  proxySetup(resource, kind, proxyFactory) {
    let relation = this.get('relationship');
    let type = this.get('type');
    let url = this.proxyUrl(resource, relation);
    let owner = Ember.getOwner(resource);
    let service = owner.lookup('service:' + pluralize(type));
    let promise = this.promiseFromCache(resource, relation, service);
    promise = promise || service.findRelated({'relation': relation, 'type': type}, url);
    let proxyProto = proxyFactory.extend(Ember.PromiseProxyMixin, {
      'promise': promise, 'type': relation, 'kind': kind
    });
    return proxyProto.create({
      content: (kind === 'toOne') ? Ember.Object.create() : Ember.A([])
    });
  },

  /**
    @method proxyResolution
    @param {proxy} resource
    @return {PromiseProxy} proxy
  */
  proxyResolution(resource, proxy) {
    proxy.then(
      function (resources) {
        proxy.set('content', resources);
        let relation = proxy.get('type');
        let kind = proxy.get('kind');
        resource.didResolveProxyRelation(relation, kind, resources);
        return resources;
      },
      function (error) {
        Ember.Logger.error(error);
        throw error;
      }
    );
    return proxy;
  },

  /**
    Proxy url to fetch for the resource's relation

    @method proxyUrl
    @param {Resource} resource
    @param {String} relation
    @return {PromiseProxy} proxy
  */
  proxyUrl(resource, relation) {
    let related = linksPath(relation);
    let url = resource.get(related);
    if (typeof url !== 'string') {
      throw new Error('RelatedProxyUtil#_proxyUrl expects `model.'+ related +'` property to exist.');
    }
    return url;
  },

  /**
    Lookup relation from service cache and pomisify result

    @method promiseFromCache
    @param {Resource} resource
    @param {String} relation
    @param {Object} service
    @return {Promise|null}
  */
  promiseFromCache(resource, relation, service) {
    let data = resource.get('relationships.' + relation + '.data');
    if (!data) { return; }
    let content, found;
    if (Array.isArray(data)) {
      content = Ember.A([]);
      for (let i = 0; i < data.length; i++) {
        found = this.serviceCacheLookup(service, data[i]);
        if (found) {
          content.push(found);
        }
      }
      content = (data.length && data.length === content.length) ? content : null;
    } else {
      content = this.serviceCacheLookup(service, data);
    }
    return (content) ? RSVP.Promise.resolve(content) : null;
  },

  /**
    Lookup data in service cache

    @method serviceCacheLookup
    @param {Object} service
    @param {Object} data
    @return {Resource|undefined}
  */
  serviceCacheLookup(service, data) {
    return (typeof data === 'object' && data.id) ? service.cacheLookup(data.id) : undefined;
  }
});

export default RelatedProxyUtil;

/**
  @method linksPath
  @param {String} relation
  @return {String} path to the related link
*/
export function linksPath(relation) {
  return ['relationships', relation, 'links', 'related'].join('.');
}
