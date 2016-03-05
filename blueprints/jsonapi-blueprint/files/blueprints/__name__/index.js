/*jshint node:true*/
module.exports = {
  description: '<%= name %>',

  normalizeEntityName: function () {},

  afterInstall: function(options) {
    return this.addPackagesToProject([{
      name: 'ember-jsonapi-resources',
      target: '~1.1.2'
    }]);
  }
};
