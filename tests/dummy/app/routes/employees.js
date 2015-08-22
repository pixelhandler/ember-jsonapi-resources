import Ember from 'ember';

export default Ember.Route.extend({
  model() {
    const options = {
      query: {
        sort: 'name',
        include: 'pictures'
      }
    };
    return this.store.find('employees', options);
  },

  actions: {
    error(error) {
      Ember.Logger.error(error);
    }
  }
});
