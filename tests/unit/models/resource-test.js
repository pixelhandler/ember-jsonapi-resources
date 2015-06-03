import { moduleFor, test } from 'ember-qunit';
import Resource from 'ember-jsonapi-resources/models/resource';
import { attr } from 'ember-jsonapi-resources/models/resource';

moduleFor('model:resource', 'Unit | Model | resource');

test('it creates an instance', function(assert) {
  let resource = this.subject();
  assert.ok(!!resource);
});

test('attr() helper creates a computed property using a unique (protected) attributes hash', function(assert) {
  const Factory = this.container.lookupFactory('model:resource');

  let factoryInstanceA = Factory.create({'name': 'Ricky'});
  assert.equal(factoryInstanceA.get('name'), 'Ricky', 'factoryInstanceA name is set to Ricky');

  let factoryInstanceB = Factory.create();
  assert.equal(factoryInstanceB.get('name'), undefined, 'factoryInstanceB name is NOT set to Ricky');

  let staticInstanceA = Resource.create({'name': 'Lucy'});
  assert.equal(staticInstanceA.get('name'), 'Lucy', 'staticInstanceA name is set to Lucy');

  let staticInstanceB = Resource.create();
  assert.equal(staticInstanceB.get('name'), undefined, 'staticInstanceB name is NOT set to Lucy');

  const Ricardos = Resource.extend({
    name: attr()
  });

  let lilRicky = Ricardos.create({'name': 'Ricky Jr'});
  assert.equal(lilRicky.get('name'), 'Ricky Jr', 'lilRicky name is set to Ricky Jr');

  let otherLilRicky = Ricardos.create();
  assert.equal(otherLilRicky.get('name'), undefined, 'otherLilRicky name is NOT set to Ricky Jr');
});
