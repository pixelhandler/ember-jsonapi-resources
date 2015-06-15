import Ember from 'ember';

export default Ember.Route.extend({
  serviceName: 'posts',

  model() {
    return this.store.find('posts', { query: { 'page[limit]': 10, 'sort': '-date' }});
  },

  actions: {
    destroy(model) {
      this.modelFor('admin.index').removeObject(model);
      return this.store.deleteResource('posts', model).then(function() {
        this.refresh();
      }.bind(this)).catch(function(e) {
        console.error(e);
      });
    }
  }
});
