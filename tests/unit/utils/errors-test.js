import { ServerError, ClientError, FetchError } from 'ember-jsonapi-resources/utils/errors';
import { module, test } from 'qunit';

module('Unit | Utility | errors');

test('ServerError', function(assert) {
  assert.throws(
    function() {
      throw new ServerError();
    },
    ServerError,
    "raised error is an instance of ServerError"
  );
});

test('ClientError', function(assert) {
  assert.throws(
    function() {
      throw new ClientError();
    },
    ClientError,
    "raised error is an instance of ClientError"
  );
});

test('FetchError', function(assert) {
  assert.throws(
    function() {
      throw new FetchError();
    },
    FetchError,
    "raised error is an instance of FetchError"
  );
});
