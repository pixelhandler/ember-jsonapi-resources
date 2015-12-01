import Ember from 'ember';

export default Ember.Controller.extend({
  actions: {
    update(model) {
      return this.store.updateResource('posts', model).catch(function(err) {
        Ember.Logger.error(err);
        model.rollback();
      });
    }
  }
});
