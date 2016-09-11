'use strict';

var EOL                  = require('os').EOL;
var blueprintHelpers     = require('ember-cli-blueprint-test-helpers/helpers');
var setupTestHooks       = blueprintHelpers.setupTestHooks;
var emberNew             = blueprintHelpers.emberNew;
var emberGenerateDestroy = blueprintHelpers.emberGenerateDestroy;
var emberGenerate        = blueprintHelpers.emberGenerate;

var expect = require('ember-cli-blueprint-test-helpers/chai').expect;
var sleep = require('sleep');

describe('Acceptance: ember generate and destroy jsonapi-resource', function() {
  setupTestHooks(this);

  it('generates jsonapi-resource files (model, serializer, adapter, service, tests)', function() {
    var args = ['jsonapi-resource', 'foo'];

    return emberNew()
      .then(() => emberGenerateDestroy(args, (file) => {
        // model & unit test
        expect(file('app/models/foo.js'))
          .to.contain("import Ember from 'ember';"+EOL)
          .to.contain("import Resource from 'ember-jsonapi-resources/models/resource';"+EOL)
          .to.contain("import { attr, hasOne, hasMany } from 'ember-jsonapi-resources/models/resource';"+EOL);
        expect(file('tests/unit/models/foo-test.js'))
          .to.contain("import Ember from 'ember';"+EOL)
          .to.contain("import Model from '../../../models/foo';"+EOL)
          .to.contain("import { moduleFor, test } from 'ember-qunit';"+EOL);

        // serializer and tests
        expect(file('app/serializers/foo.js'))
          .to.contain("import ApplicationSerializer from './application';"+EOL)
          .to.contain("export default ApplicationSerializer.extend({"+EOL)
          // we're not testing the body here
          .to.contain("});"+EOL);
        expect(file('tests/unit/serializers/foo-test.js'))
          .to.contain("import Ember from 'ember';"+EOL)
          .to.contain("import Resource from '../../../models/foo';"+EOL)
          .to.contain("import { moduleFor, test } from 'ember-qunit';"+EOL);

        // adapter and tests
        expect(file('app/adapters/foo.js'))
          .to.contain("import ApplicationAdapter from './application';"+EOL)
          .to.contain("import config from '../config/environment';"+EOL)
          .to.contain("export default ApplicationAdapter.extend({"+EOL)
          // we're not testing the body here, except for type
          .to.contain("type: 'foo',"+EOL)
          .to.contain("});"+EOL);
        expect(file('tests/unit/adapters/foo-test.js'))
          .to.contain("import { moduleFor, test } from 'ember-qunit';"+EOL);

        // service and tests
        expect(file('app/services/foos.js'))
          .to.contain("import Adapter from '../adapters/foo';"+EOL)
          .to.contain("import ServiceCache from '../mixins/service-cache';"+EOL)
          .to.contain("Adapter.reopenClass({ isServiceFactory: true });"+EOL)
          .to.contain("export default Adapter.extend(ServiceCache);"+EOL);
        expect(file('tests/unit/services/foos-test.js'))
          .to.contain("import { moduleFor, test } from 'ember-qunit';"+EOL);
    }));
  });
});
