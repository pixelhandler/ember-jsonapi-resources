import Ember from 'ember';

export default Ember.Route.extend({

  model() {
    const options = {
      query: {
        sort: '-date',
        include: 'author',
        'page[offset]': 0,
        'page[limit]': 5
      }
    };
    return this.store.find('posts', options);
  }
});
