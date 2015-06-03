import Ember from 'ember';

export default Ember.Object.extend({

  serialize(resources) {
    const json = { data: null };

    if (Array.isArray(resources)) {
      json.data = this.serializeResources(resources);
    } else {
      json.data = this.serializeResource(resources);
    }

    return json;
  },

  serializeResources(resources) {
    const collection = Ember.A([]);

    resources.forEach(function(resource) {
      collection.pushObject(this.serializeRecord(resource));
    }, this);

    return collection;
  },

  serializeResource(resource) {
    const json = resource.getProperties('type', 'attributes', 'relationships');
    for (let relationship in json.relationships) {
      if (json.relationships.hasOwnProperty(relationship)) {
        delete json.relationships[relationship].links;
        if (!json.relationships[relationship].data) {
          delete json.relationships[relationship];
        }
      }
    }
    return json;
  },

  serializeChanged(resource) {
    let json = resource.getProperties('id', 'type', 'changedAttributes');
    return {
      data: {
        type: json.type,
        id: json.id,
        attributes: json.changedAttributes
      }
    };
  },

  deserialize(resource) {
    if (Array.isArray(resource.data)) {
      return this.deserializeResources(Ember.A(resource.data));
    } else if (typeof resource.data === 'object') {
      return this.deserializeResource(resource.data);
    } else {
      return null;
    }
  },

  deserializeResources(collection) {
    for (let i = 0; i < collection.length; i++) {
      collection[i] = this.deserializeResource(collection[i]);
    }
    return collection;
  },

  deserializeResource(resource) {
    return this._createResourceInstance(resource);
  },

  _createResourceInstance(resource) {
    const factoryName = 'model:' + resource.type;
    return this.container.lookupFactory(factoryName).create({
      'attributes': resource.attributes,
      'id': resource.id,
      'relationships': resource.relationships,
      'links': resource.links
    });
  }
});
