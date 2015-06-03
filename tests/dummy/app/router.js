import Ember from 'ember';
import config from './config/environment';

var Router = Ember.Router.extend({
  location: config.locationType
});

Router.map(function() {
  this.route('index', { path: '/' });
  this.resource('post', { path: '/:post_id' }, function () {
    this.route('detail', { path: '/' });
    this.route('comments');
  });
});

export default Router;
