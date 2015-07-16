import Ember from 'ember';
import AuthorizationMixin from '../../../mixins/authorization';
import { module, test } from 'qunit';

module('Unit | Mixin | authorization', {
  beforeEach() {
    window.localStorage.removeItem('AuthorizationHeader');
  },
  afterEach() {
    window.localStorage.removeItem('AuthorizationHeader');
  }
});

test('it uses "Authorization" for a header field', function(assert) {
  let AuthorizationObject = Ember.Object.extend(AuthorizationMixin);
  let subject = AuthorizationObject.create();
  let msg = 'Authorization is the value of the property: authorizationHeaderField';
  assert.equal(subject.get('authorizationHeaderField'), 'Authorization', msg);
});

test('it uses "AuthorizationHeader" for the storage key used to lookup credentials', function(assert) {
  let AuthorizationObject = Ember.Object.extend(AuthorizationMixin);
  let subject = AuthorizationObject.create();
  let msg = 'AuthorizationHeader is the value of the property: authorizationHeaderStorageKey';
  assert.equal(subject.get('authorizationHeaderStorageKey'), 'AuthorizationHeader', msg);
});

test('it has a (private) property _storage set to: "localStorage"', function(assert) {
  let AuthorizationObject = Ember.Object.extend(AuthorizationMixin);
  let subject = AuthorizationObject.create();
  let msg = 'localStorage is the value of the property: _storage';
  assert.equal(subject.get('_storage'), 'localStorage', msg);
});

test('it has a property authorizationCredential that gets and sets a credential/token', function(assert) {
  let AuthorizationObject = Ember.Object.extend(AuthorizationMixin);
  let subject = AuthorizationObject.create();
  assert.ok(!subject.get('authorizationCredential'), 'authorizationCredential is not defined yet.');

  let credential = 'supersecrettokenthatnobodycancrack';
  subject.set('authorizationCredential', credential);

  let msg = 'localStorage["AuthorizationHeader"] is set to ' + credential;
  assert.equal(window.localStorage.getItem('AuthorizationHeader'), credential, msg);

  msg = 'authorizationCredential is set to ' + credential;
  assert.equal(subject.get('authorizationCredential'), credential, msg);
});
