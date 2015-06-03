import Ember from 'ember';

export default Ember.Route.extend({

  setupController(controller, model) {
    this._super(controller, model);
    this.controllerFor('post.comments').set('model', model.get('comments'));
  },

  renderTemplate(controller, model) {
    this._super(controller, model);
    this.render('post.comments', {
      into: 'post.detail',
      outlet: 'comments',
      controller: this.controllerFor('post.comments')
    });
  }
});
