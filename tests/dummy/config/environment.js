/* jshint node: true */

module.exports = function(environment) {
  var ENV = {
    modulePrefix: 'dummy',
    environment: environment,
    baseURL: '/',
    locationType: 'auto',
    EmberENV: {
      FEATURES: {
        // Here you can enable experimental features on an ember canary build
        // e.g. 'with-controller': true
      },
      MODEL_FACTORY_INJECTIONS: true
    },

    APP: {
      // Here you can pass flags/options to your application instance
      // when it is created
      API_HOST: '/',
      API_HOST_PROXY: 'http://api.pixelhandler.com/',
      API_PATH: 'api/v1',
    },
    contentSecurityPolicy: {
      'connect-src': "'self' api.pixelhandler.com localhost:3000 0.0.0.0:3000",
      'img-src': "'self' www.gravatar.com"
    }
  };

  if (environment === 'development') {
    // ENV.APP.LOG_RESOLVER = true;
    // ENV.APP.LOG_ACTIVE_GENERATION = true;
    // ENV.APP.LOG_TRANSITIONS = true;
    // ENV.APP.LOG_TRANSITIONS_INTERNAL = true;
    // ENV.APP.LOG_VIEW_LOOKUPS = true;
  }

  if (environment === 'test') {
    // Testem prefers this...
    ENV.baseURL = '/';
    ENV.locationType = 'none';

    // keep test console output quieter
    ENV.APP.LOG_ACTIVE_GENERATION = false;
    ENV.APP.LOG_VIEW_LOOKUPS = false;

    ENV.APP.rootElement = '#ember-testing';
  }

  if (environment === 'production') {

  }

  return ENV;
};
