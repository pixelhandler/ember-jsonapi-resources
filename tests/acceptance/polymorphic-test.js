import Ember from 'ember';
import { module, test } from 'qunit';
import startApp from '../../tests/helpers/start-app';

import picturesMock from 'fixtures/api/pictures';
import pictures1Mock from 'fixtures/api/pictures/1';
import pictures1ImageableMock from 'fixtures/api/pictures/1/imageable';
import pictures5Mock from 'fixtures/api/pictures/5';
import pictures5ImageableMock from 'fixtures/api/pictures/5/imageable';

module('Acceptance | polymorphic', {
  beforeEach: function() {
    this.sandbox = window.sinon.sandbox.create();
    this.application = startApp();
  },

  afterEach: function() {
    Ember.run(this.application, 'destroy');
    this.sandbox.restore();
  }
});

test('visiting /pictures list', function(assert) {
  assert.expect(6);
  setupFetchResonses(this.sandbox);

  visit('/pictures');
  andThen(function() {
    assert.equal(currentURL(), '/pictures', 'Pictures route rendered');
    let listItems = document.querySelector('#ember-testing ul').querySelectorAll('li');
    let name;
    for (let i = 0; i < picturesMock.data.length; i++) {
      name = picturesMock.data[i].attributes.name;
      assert.equal(listItems[i].innerText, name, 'item rendered: ' + name);
    }
  });
});

test('visiting /pictures/1, picture with an (imageable) product relation', function(assert) {
  assert.expect(3);
  setupFetchResonses(this.sandbox);

  visit('/pictures/1');
  andThen(function() {
    assert.equal(currentURL(), '/pictures/1', 'Pictures #1 route rendered');
    let content = document.querySelectorAll('#ember-testing p');
    let name = pictures1Mock.data.attributes.name;
    assert.ok(content[0].innerText.trim().match(name) !== null, name + ' rendered in outlet');
    let imageableName = pictures1ImageableMock.data.attributes.name;
    assert.ok(content[1].innerText.trim().match(imageableName) !== null, imageableName + ' rendered in outlet');
  });
});

test('visiting /pictures/5, picture with an (imageable) employee relation', function(assert) {
  assert.expect(3);
  setupFetchResonses(this.sandbox);

  visit('/pictures/5');
  andThen(function() {
    assert.equal(currentURL(), '/pictures/5', 'Pictures #5 route rendered');
    let content = document.querySelectorAll('#ember-testing p');
    let name = pictures5Mock.data.attributes.name;
    assert.ok(content[0].innerText.trim().match(name) !== null, name + ' rendered in outlet');
    let imageableName = pictures5ImageableMock.data.attributes.name;
    assert.ok(content[1].innerText.trim().match(imageableName) !== null, imageableName + ' rendered in outlet');
  });
});


function setupFetchResonses(sandbox) {
  sandbox.stub(window, 'fetch', function (url) {
    let resp;
    switch(url) {
      case 'api/v1/pictures?sort=id&include=imageable':
        resp = picturesMockResponse();
        break;
      case 'api/v1/pictures/1':
        resp = pictures1MockResponse();
        break;
      case '/api/v1/pictures/1/imageable':
        resp = pictures1ImageableMockResponse();
        break;
      case 'api/v1/pictures/5':
        resp = pictures5MockResponse();
        break;
      case '/api/v1/pictures/5/imageable':
        resp = pictures5ImageableMockResponse();
        break;
      default:
        throw('no mocked fetch reponse for request');
    }
    return resp;
  });
}

function picturesMockResponse() {
  return Ember.RSVP.Promise.resolve({
    "status": 200,
    "json": function() {
      return Ember.RSVP.Promise.resolve(picturesMock);
    }
  });
}

function pictures1MockResponse() {
  return Ember.RSVP.Promise.resolve({
    "status": 200,
    "json": function() {
      return Ember.RSVP.Promise.resolve(pictures1Mock);
    }
  });
}

function pictures1ImageableMockResponse() {
  return Ember.RSVP.Promise.resolve({
    "status": 200,
    "json": function() {
      return Ember.RSVP.Promise.resolve(pictures1ImageableMock);
    }
  });
}

function pictures5MockResponse() {
  return Ember.RSVP.Promise.resolve({
    "status": 200,
    "json": function() {
      return Ember.RSVP.Promise.resolve(pictures5Mock);
    }
  });
}

function pictures5ImageableMockResponse() {
  return Ember.RSVP.Promise.resolve({
    "status": 200,
    "json": function() {
      return Ember.RSVP.Promise.resolve(pictures5ImageableMock);
    }
  });
}
