import ApplicationAdapter from './application';
import config from '../config/environment';
//import { pluralize } from 'ember-inflector';

export default ApplicationAdapter.extend({
  type: 'imageable',

  url: null,

  fetchUrl: function(url) {
    const proxy = config.APP.API_HOST_PROXY;
    const host = config.APP.API_HOST;
    if (proxy && host) {
      url = url.replace(proxy, host);
    }
    return url;
  },

  find() {},
  findOne() {},
  findQuery() {},
  cacheUpdate() {},
  cacheResource() {},
  initEvents() {}
});
