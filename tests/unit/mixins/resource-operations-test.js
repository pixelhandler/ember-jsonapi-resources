import Ember from 'ember';
// import ResourceOperationsMixin from 'ember-jsonapi-resources/mixins/resource-operations';
import { module, test } from 'qunit';
import Resource from 'ember-jsonapi-resources/models/resource';
import { attr/*, hasOne, hasMany*/ } from 'ember-jsonapi-resources/models/resource';

const { RSVP } = Ember;

// ResourceOperationsMixin is mixed into Resource so will use Resource for test subject.
module('Unit | Mixin | resource-operations', {
  beforeEach() {
    this.sandbox = window.sinon.sandbox.create();
    let Cowboy = Resource.extend({
      type: 'cowboy',
      service: {
        createRelationship: this.sandbox.spy(function () { return RSVP.Promise.resolve(); }),
        patchRelationship: this.sandbox.spy(function () { return RSVP.Promise.resolve(); }),
        deleteRelationship: this.sandbox.spy(function () { return RSVP.Promise.resolve(); }),
        trigger: Ember.K
      },
      name: attr('string'),
      // mock relationship computed properties
      guns: {kind: 'hasMany', mapBy: Ember.K }, // hasMany('guns')
      horse: {kind: 'hasOne', get: Ember.K } // hasOne('horse')
    });
    this.subject = Cowboy.create({ id: 1, name:'Lone Ranger'});
    // mock payload setup
    this.subject.set('relationships', {
      guns: { links: { related: 'url' } },
      horse: { links: { related: 'url' } } 
    });
  },
  afterEach() {
    this.sandbox.restore();
    delete this.subject;
    delete this.sandbox;
  }
});

test('createRelationship for to-many relation', function(assert) {
  this.sandbox.stub(this.subject, 'addRelationship');
  let promise = this.subject.createRelationship('guns', 1);
  assert.ok(typeof promise.then === 'function', 'returns a thenable');
  assert.ok(
    this.subject.addRelationship.calledWith('guns', 1),
    'called addRelationship'
  );

  let args = this.subject.get('service').createRelationship.firstCall.args;
  assert.equal( args[0], this.subject,
    'called service.createRelationship with the resource instance'
  );
  assert.equal( args[1], 'guns',
    'called service.createRelationship with relationship arg: guns'
  );
  assert.equal( args[2], 1,
    'called service.createRelationship with id arg: 1'
  );
});

test('deleteRelationship for to-many relation', function(assert) {
  this.sandbox.stub(this.subject, 'removeRelationship');
  let promise = this.subject.deleteRelationship('guns', 2);
  assert.ok(typeof promise.then === 'function', 'returns a thenable');
  assert.ok(
    this.subject.removeRelationship.calledWith('guns', 2),
    'called removeRelationship'
  );

  let args = this.subject.get('service').deleteRelationship.firstCall.args;
  assert.equal( args[0], this.subject,
    'called service.createRelationship with the resource instance'
  );
  assert.equal( args[1], 'guns',
    'called service.createRelationship with relationship arg: guns'
  );
  assert.equal( args[2], 2,
    'called service.createRelationship with id arg: 2'
  );
});

test('updateRelationship for to-one relation', function(assert) {
  this.sandbox.stub(this.subject, '_updateRelationshipsData');

  let promise = this.subject.updateRelationship('horse', 1);
  assert.ok(typeof promise.then === 'function', 'returns a thenable');
  assert.ok(
    this.subject._updateRelationshipsData.calledWith('horse', 1),
    'called _updateRelationshipsData'
  );

  let args = this.subject.get('service').patchRelationship.firstCall.args;
  assert.equal( args[0], this.subject,
    'called service.patchRelationship with the resource instance'
  );
  assert.equal( args[1], 'horse',
    'called service.patchRelationship with relationship arg: horse'
  );
});
