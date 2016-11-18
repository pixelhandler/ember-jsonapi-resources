import Ember from 'ember';

export default Ember.Route.extend({
  beforeModel() {
    return this.store.find('authors').then(function (authors) {
      this.set('authors', authors);
    }.bind(this));
  },

  model() {
    let owner = Ember.getOwner(this);
    return owner._lookupFactory('model:post').create({
      isNew: true,
      attributes: { date: new Date() }
    });
  },

  afterModel(resource) {
    const author = this.get('authors.firstObject');
    resource.addRelationship('author', author.get('id'));
    return resource;
  },

  actions: {
    save(resource) {
      this.store.createResource('posts', resource).then(function(resp) {
        let collection = this.modelFor('admin.index');
        if (collection) { collection.addObject(resp); }
        collection = this.modelFor('index');
        if (collection) { collection.addObject(resp); }
        this.transitionTo('admin.index');
      }.bind(this));
    },

    cancel() {
      this.transitionTo('admin.index');
    }
  },

  deactivate() {
    this.modelFor('admin.create').destroy();
  }
});
