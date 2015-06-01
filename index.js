/* jshint node: true */
'use strict';

module.exports = {
  name: 'ember-jsonapi-resources',

  included: function(app) {
    this._super.included(app);

    app.import({
      development: app.bowerDirectory + '/es6-promise/promise.js',
      production: app.bowerDirectory + '/es6-promise/promise.min.js'
    });

    app.import(app.bowerDirectory + '/fetch/fetch.js');
  },

  afterInstall: function() {
    return this.addPackagesToProject([
      { name : 'inflection', version : '~1.7.1' },
      { name : 'lodash', version : '~1.0.3' },
      { name : 'ember-inflector', version : '^1.6.2' }
    ]);
  }
};
