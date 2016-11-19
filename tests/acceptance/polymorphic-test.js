import Ember from 'ember';
import RSVP from 'rsvp';
import { module, test } from 'qunit';
import startApp from '../../tests/helpers/start-app';

import picturesMock from 'fixtures/api/pictures';
import pictures1Mock from 'fixtures/api/pictures/1';
import pictures1ImageableMock from 'fixtures/api/pictures/1/imageable';
import pictures5Mock from 'fixtures/api/pictures/5';
import pictures5ImageableMock from 'fixtures/api/pictures/5/imageable';

import config from '../../config/environment';

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
  setupFetchResponses(this.sandbox);

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
  setupFetchResponses(this.sandbox);

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
  setupFetchResponses(this.sandbox);

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


function setupFetchResponses(sandbox) {
  const apiUrl = [config.APP.API_HOST, config.APP.API_PATH].join('/');
  sandbox.stub(window, 'fetch', function (url) {
    let resp;
    switch(url) {
      case [apiUrl, 'pictures?sort=id&include=imageable'].join('/'):
        resp = picturesMockResponse();
        break;
      case [apiUrl, 'pictures/1'].join('/'):
        resp = pictures1MockResponse();
        break;
      case [apiUrl, 'pictures/1/imageable'].join('/'):
      case pictures1Mock.data.relationships.imageable.links.related:
        resp = pictures1ImageableMockResponse();
        break;
      case [apiUrl, 'pictures/5'].join('/'):
        resp = pictures5MockResponse();
        break;
      case [apiUrl, 'pictures/5/imageable'].join('/'):
      case pictures5Mock.data.relationships.imageable.links.related:
        resp = pictures5ImageableMockResponse();
        break;
      default:
        throw('no mocked fetch reponse for request: ' + url);
    }
    return resp;
  });
}

function picturesMockResponse() {
  return RSVP.Promise.resolve({
    "status": 200,
    "json": function() {
      return RSVP.Promise.resolve(picturesMock);
    }
  });
}

function pictures1MockResponse() {
  return RSVP.Promise.resolve({
    "status": 200,
    "json": function() {
      return RSVP.Promise.resolve(pictures1Mock);
    }
  });
}

function pictures1ImageableMockResponse() {
  return RSVP.Promise.resolve({
    "status": 200,
    "json": function() {
      return RSVP.Promise.resolve(pictures1ImageableMock);
    }
  });
}

function pictures5MockResponse() {
  return RSVP.Promise.resolve({
    "status": 200,
    "json": function() {
      return RSVP.Promise.resolve(pictures5Mock);
    }
  });
}

function pictures5ImageableMockResponse() {
  return RSVP.Promise.resolve({
    "status": 200,
    "json": function() {
      return RSVP.Promise.resolve(pictures5ImageableMock);
    }
  });
}
