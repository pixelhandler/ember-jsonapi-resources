import Ember from 'ember';

export default Ember.Route.extend({
  model() {
    const options = {
      query: {
        sort: 'id',
        include: 'imageable'
      }
    };
    return this.store.find('pictures', options);
  },

  actions: {
    error(error) {
      Ember.Logger.error(error);
    }
  }
});
