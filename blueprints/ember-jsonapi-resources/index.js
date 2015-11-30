module.exports = {
  description: 'ember-jsonapi-resources',

  normalizeEntityName: function () {},

  afterInstall: function () {
    return this.addBowerPackagesToProject([
      { name: 'fetch' },
      { name: 'es6-promise' }
    ]);
  }
};
