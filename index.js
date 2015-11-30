/* jshint node: true */
'use strict';

module.exports = {
  name: 'ember-jsonapi-resources',

  included: function(app) {
    this._super.included.apply(this, arguments);

    app.import({
      development: app.bowerDirectory + '/es6-promise/promise.js',
      production: app.bowerDirectory + '/es6-promise/promise.min.js'
    });

    app.import(app.bowerDirectory + '/fetch/fetch.js');
  },

  afterInstall: function() {
    return this.addPackagesToProject([
      { name : 'inflection', version : '~1.7.1' },
      { name : 'lodash', version : '~3.10.1' },
      { name : 'ember-inflector', version : '^1.6.2' },
      { name : 'ember-cli-string-utils', version: '^1.0.0' },
      { name : 'ember-cli-path-utils', version: '^1.0.0' },
      { name : 'ember-cli-test-info', version: '^1.0.0' },
      { name : 'ember-cli-get-dependency-depth', version: '^1.0.0' },
      { name : 'silent-error', version: '^1.0.0' }
    ]);
  }
};
