module.exports = {
  normalizeEntityName() {},

  afterInstall() {
    this.addBowerPackageToProject('es6-promise');
    return this.addBowerPackageToProject('fetch');
  }
};
