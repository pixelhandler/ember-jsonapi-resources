import Ember from 'ember';

export default Ember.Route.extend({
  beforeModel() {
    return this.store.find('authors').then(function (authors) {
      this.set('authors', authors);
    }.bind(this));
  },

  model() {
    return this.container.lookup('model:posts').create({
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
        this.modelFor('admin.index').addObject(resp);
        this.modelFor('index').addObject(resp);
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
