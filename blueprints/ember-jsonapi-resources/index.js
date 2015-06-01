module.exports = {
  description: 'ember-jsonapi-resources',

  normalizeEntityName: function () {},

  afterInstall: function () {
    return this.addBowerPackageToProject('fetch').then(function() {
      return this.addBowerPackageToProject('es6-promise');
    }.bind(this));
  }
};
