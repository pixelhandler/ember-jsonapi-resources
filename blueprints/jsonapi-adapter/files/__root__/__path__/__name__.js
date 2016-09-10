<%= importStatement %>
import config from '../config/environment';

export default <%= baseClass %>.extend({
  type: '<%= entity %>',

  /**
    Full url/path to API endpoint for this resource.

    This property is optional, as the application adapter provides a sane
    default combining config.APP.API_HOST, config.APP.API_PATH and type
    through Ember computed properties. This is faster however, and provides
    easy customization per adapter.

    Url is always fetched through #fetchUrl method to provide runtime
    manipulation of the url, either per adapter or application-wide on the
    application adapter. See AdapterApiHostProxyMixin for an example.

    @property url
    @type String
  */
  url: [config.APP.API_HOST, config.APP.API_PATH, '<%= resource %>'].join('/')
});
