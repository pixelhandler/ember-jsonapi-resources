import Ember from 'ember';

export default Ember.Route.extend({
  model(params) {
    return new Ember.RSVP.Promise(function (resolve, reject) {
      const found = this.store.all('posts').filter(function (post) {
        return post.get('id') === params.post_id;
      });
      if (found.get('length') > 0) {
        resolve(found[0]);
      } else {
        this.store.find('post', params.post_id).then(
          function (post) {
            resolve(post);
          },
          function (error) {
            reject(error);
          }
        );
      }
    }.bind(this));
  },

  actions: {
    error(error) {
      Ember.Logger.error(error);
    }
  }
});
