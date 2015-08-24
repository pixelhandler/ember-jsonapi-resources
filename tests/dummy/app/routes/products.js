import Ember from 'ember';

export default Ember.Route.extend({
  model() {
    const options = {
      query: {
        sort: '-id',
        include: 'pictures'
      }
    };
    return this.store.find('products', options);
  },

  actions: {
    error(error) {
      Ember.Logger.error(error);
    }
  }
});
