import Ember from 'ember';

export default Ember.Route.extend({

  model() {
    const options = {
      query: {
        sort: '-date',
        include: 'author'
      }
    };
    return this.store.find('posts', options);
  }
});
