/**
  @module ember-jsonapi-resources
  @submodule adapter-api-host-proxy-mixin
**/
import Ember from 'ember';

/**
  Mixin to provide url rewrite for proxied api. Mostly used as example.

  @class AdapterApiHostProxyMixin
  @static
*/
export default Ember.Mixin.create({
	fetchUrl: function(url) {
    const config = this.container.lookupFactory('config:environment');
    const proxy  = config.APP.API_HOST_PROXY;
    const host   = config.APP.API_HOST;
    if (proxy && host) {
      url = url.replace(host, proxy);
    }
    return url;
  }
});
