import Ember from 'ember';
import RSVP from 'rsvp';

export default Ember.Route.extend({
  model(params) {
    return new RSVP.Promise(function (resolve, reject) {
      const found = this.store.all('posts').filter(function (post) {
        return post.get('id') === params.post_id;
      });
      if (found.get('length') > 0) {
        resolve(found[0]);
      } else {
        const options = {
          id: params.post_id,
          query: { include: 'author,comments' }
        };
        this.store.find('post', options).then(
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
