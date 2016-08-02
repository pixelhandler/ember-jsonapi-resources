import Ember from 'ember';
import RSVP from 'rsvp';
import FetchMixin from '../../../mixins/fetch';
import { module, test } from 'qunit';

let sandbox;

function RSVPonerror(error) {
  throw new Error(error);
}

module('Unit | Mixin | fetch', {
  beforeEach() {
    sandbox = window.sinon.sandbox.create();
    this.server = sandbox.useFakeServer();
    this.server.xhr.useFilters = true;
    // Filtered requests will not be faked
    this.server.xhr.addFilter( function( method, url ) {
      return url.match(/\/write-blanket-coverage/);
    });
    this.server.autoRespond = true;
    RSVP.configure('onerror', RSVPonerror);
    window.localStorage.removeItem('AuthorizationHeader');
    let FetchObject = Ember.Object.extend(FetchMixin);
    this.subject = FetchObject.create();
  },
  afterEach() {
    sandbox.restore();
    window.localStorage.removeItem('AuthorizationHeader');
    delete this.subject;
    delete this.server;
  }
});

test('#useAjax default value is false', function(assert) {
  assert.equal(this.subject.get('useAjax'), false, 'useAjax flag is false');
});

test('#useFetch default value is true', function(assert) {
  assert.equal(this.subject.get('useFetch'), true, 'useFetch flag is true');
});

test('#_ajax handles 5xx (Server Error)', function(assert) {
  assert.expect(3);
  const done = assert.async();
  this.server.respondWith('GET', '/posts', [500, {}, ""]);
  let promise = this.subject._ajax('/posts', { method: 'GET' }, false);
  assert.ok(typeof promise.then === 'function', 'returns a thenable');
  promise.catch(function(error) {
    assert.equal(error.name, 'ServerError', '5xx response throws a custom error');
    assert.equal(error.code, 500, 'error code 500');
    done();
  });
});

test('#_ajax handles 4xx (Client Error)', function(assert) {
  assert.expect(5);
  const done = assert.async();
  this.server.respondWith('GET', '/posts/101', [
    404,
    {'Content-Type':'application/vnd.api+json'},
    JSON.stringify({
      "errors": [{
        "title": "Record not found",
        "detail": "The record identified by 101 could not be found.",
        "code": 404,
        "status": "not_found"
      }]
    })
  ]);
  let promise = this.subject._ajax('/posts/101', { method: 'GET' }, false);
  assert.ok(typeof promise.then === 'function', 'returns a thenable');
  promise.catch(function(error) {
    assert.ok(error.name, 'Client Error', '4xx response throws a custom error');
    assert.ok(Array.isArray(error.errors), '4xx error includes errors');
    assert.equal(error.errors[0].code, 404, '404 error code is in errors list');
    assert.equal(error.code, 404, 'error code 404');
    done();
  });
});

test('#_ajax handles 3xx error', function(assert) {
  assert.expect(3);
  const done = assert.async();
  this.server.respondWith('GET', '/posts', [302, {}, ""]);
  let promise = this.subject._ajax('/posts', { method: 'GET' }, false);
  assert.ok(typeof promise.then === 'function', 'returns a thenable');
  promise.catch(function(error) {
    assert.equal(error.name, 'FetchError', 'unknown error response throws a custom error');
    assert.equal(error.code, 302, '302 error code');
    done();
  });
});

test('#_ajax handles 204 (Success, no content)', function(assert) {
  assert.expect(2);
  const done = assert.async();
  this.server.respondWith('PATCH', '/posts/101', [204, {}, ""]);
  let promise = this.subject._ajax('/posts/101', { method: 'PATCH', body: 'json string here' }, false);
  assert.ok(typeof promise.then === 'function', 'returns a thenable');
  promise.then(function(res) {
    assert.equal(res, "", 'No content in the response');
    done();
  });
});

test('#_ajax handles 200 (Success) response status', function(assert) {
  assert.expect(3);
  const done = assert.async();
  this.server.respondWith('GET', '/posts/101', [
    200, {'Content-Type':'application/vnd.api+json'}, JSON.stringify({
      data: { id: 101, attributes: { name: 'Yo Post' }}
    })
  ]);
  this.subject.serializer = { deserialize: function(res) { return res.data; }, deserializeIncluded: Ember.K };
  this.subject.cacheResource = sandbox.spy();
  let promise = this.subject._ajax('/posts/101', { method: 'GET' }, false);
  assert.ok(typeof promise.then === 'function', 'returns a thenable');
  promise.then(function(res) {
    assert.equal(res.id, 101, 'has data content in the response');
    assert.ok(this.subject.cacheResource.calledOnce, '#cacheResource method called');
    done();
  }.bind(this));
});

test('#_getAjaxHeaders', function(assert) {
  let jqXHR = {
    getAllResponseHeaders: function() {
      let resHdr = "Content-Type: application/vnd.api+json\n";
      resHdr += "Cache-Control: max-age=0, private, must-revalidate\n";
      return resHdr;
    }
  };
  let headers = this.subject._getAjaxHeaders(jqXHR);
  assert.equal(headers['Content-Type'], 'application/vnd.api+json', 'JSAON API header ok');
  assert.equal(headers['Cache-Control'], 'max-age=0, private, must-revalidate', 'Catch control header ok');
});

test('#ajaxSuccessHandler handles response for empty has-one relationship', function(assert) {
  assert.expect(1);
  let result = void 0;
  let resolve = function(resp) { result = resp; };
  let jqXHR = {
    responseText: '{"data":null}'
  };
  let json = JSON.parse(jqXHR.responseText);
  this.subject.ajaxSuccessHandler(json, 'success', jqXHR, resolve, false);
  assert.ok(result === null, 'resolved with `null`');
});

test('#fetchSuccessHandler handles response for empty has-one relationship', function(assert) {
  assert.expect(1);
  let done = assert.async();
  let response = {
    "status": 200,
    "json": function() { return RSVP.Promise.resolve({ data: null }); }
  };
  let result = void 0;
  let resolve = function(resp) { result = resp; };
  let promise = this.subject.fetchSuccessHandler(response, resolve, false);
  promise.then(function() {
    assert.ok(result === null, 'resolved with `null`');
    done();
  });
});
