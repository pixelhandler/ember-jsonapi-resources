import Ember from 'ember';
import TransformsMixin from 'ember-jsonapi-resources/mixins/transforms';
import { module, test } from 'qunit';
import { dateTransform } from 'ember-jsonapi-resources/utils/transforms';

let sandbox;

module('Unit | Mixin | transforms', {
  beforeEach() {
    let Transforms = Ember.Object.extend(TransformsMixin);
    this.subject = Transforms.create();
    sandbox = window.sinon.sandbox.create();
  },
  afterEach() {
    sandbox.restore();
    delete this.subject;
  }
});

test('#serializeDateAttribute', function(assert) {
  sandbox.stub(dateTransform, 'serialize');
  this.subject.serializeDateAttribute(new Date());
  assert.ok(dateTransform.serialize.calledOnce, 'called date transform serialize method');
});

test('#deserializeDateAttribute', function(assert) {
  sandbox.stub(dateTransform, 'deserialize');
  this.subject.deserializeDateAttribute( (new Date()).toISOString() );
  assert.ok(dateTransform.deserialize.calledOnce, 'called date transform deserialize method');
});
