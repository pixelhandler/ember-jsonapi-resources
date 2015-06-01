import Ember from 'ember';

export default Ember.Route.extend({

  model() {
    return this.store.find('posts');
    /*
    return Ember.$.get('/api/v1/posts?sort=-date&fields[posts]=title,date&page[offset]=0&page[limit]=5').then(function(res) {
      let attrs = Ember.A(res.data).mapBy('attributes');
      return Ember.A(attrs);
    });*/
  }

});
