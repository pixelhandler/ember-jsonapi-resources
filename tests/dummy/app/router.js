import Ember from 'ember';
import config from './config/environment';

const Router = Ember.Router.extend({
  location: config.locationType
});

Router.map(function() {
  this.route('index', { path: '/' });
  this.route('post', { path: '/:post_id' }, function () {
    this.route('detail', { path: '/' });
    this.route('comments');
  });
  this.route('admin', function () {
    this.route('index');
    this.route('create');
    this.route('edit', { path: ':edit_id' });
  });
  this.route('products', { path: '/products' }, function () {
    this.route('detail', { path: '/:product_id' });
  });
  this.route('employees', { path: '/employees' }, function () {
    this.route('detail', { path: '/:employee_id' });
  });
  this.route('pictures', { path: '/pictures' }, function () {
    this.route('detail', { path: '/:picture_id' });
  });
});

export default Router;
