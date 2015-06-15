import Ember from 'ember';

export default Ember.Route.extend({
  model(params) {
    return this.store.find('posts', params.edit_id);
  },

  setupController(controller, model) {
    this._super(controller, model);
    controller.set('isEditing', true);
  }
});
