/* globals blanket, module */

var options = {
  modulePrefix: 'ember-jsonapi-resources',
  filter: '//.*ember-jsonapi-resources/.*/',
  antifilter: '//.*(tests|template).*/',
  loaderExclusions: [],
  enableCoverage: true,
  cliOptions: {
    reporters: ['lcov'],
    autostart: true
  }
};
if (typeof exports === 'undefined') {
  blanket.options(options);
} else {
  module.exports = options;
}
