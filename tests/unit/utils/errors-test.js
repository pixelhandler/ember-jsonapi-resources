import { ServerError, ClientError, FetchError } from 'ember-jsonapi-resources/utils/errors';
import { module, test } from 'qunit';

module('Unit | Utility | errors');

test('ServerError', function(assert) {
  assert.throws(
    function() {
      throw new ServerError();
    },
    Error,
    "raised ServerError is an instance of Error"
  );
});

test('ClientError', function(assert) {
  assert.throws(
    function() {
      throw new ClientError();
    },
    Error,
    "raised ClientError is an instance of Error"
  );
});

test('FetchError', function(assert) {
  assert.throws(
    function() {
      throw new FetchError();
    },
    Error,
    "raised FetchError is an instance of Error"
  );
});
