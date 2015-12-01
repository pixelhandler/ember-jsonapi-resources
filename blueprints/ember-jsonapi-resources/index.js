var Promise = require('ember-cli/lib/ext/promise');

module.exports = {
  description: 'ember-jsonapi-resources',

  normalizeEntityName: function () {},

  afterInstall: function () {
    return Promise.all([
      this.addBowerPackagesToProject([
        { name: 'fetch' },
        { name: 'es6-promise' }
      ]),
      this.addPackagesToProject([
        { name: 'inflection', target: '~1.7.1' },
        { name: 'lodash', target: '~3.10.1' },
        { name: 'ember-inflector',target: '^1.6.2' },
        { name: 'ember-cli-string-utils', target: '^1.0.0' },
        { name: 'ember-cli-path-utils', target: '^1.0.0' },
        { name: 'ember-cli-test-info', target: '^1.0.0' },
        { name: 'ember-cli-get-dependency-depth', target: '^1.0.0' },
        { name: 'silent-error', target: '^1.0.0' }
      ])
    ]);
  }
};
