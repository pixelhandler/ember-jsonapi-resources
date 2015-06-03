import ApplicationAdapter from 'ember-jsonapi-resources/adapters/application';
import config from '../config/environment';

export default ApplicationAdapter.extend({
  type: 'comment',

  url: config.APP.API_PATH + '/comments',

  fetchUrl: function(url) {
    const proxy = config.APP.API_HOST_PROXY;
    const host = config.APP.API_HOST;
    if (proxy && host) {
      url = url.replace(proxy, host);
    }
    return url;
  }
});
