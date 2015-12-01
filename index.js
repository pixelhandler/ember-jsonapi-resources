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
  }
};
