## Example Application

The [tests/dummy/app](https://github.com/pixelhandler/ember-jsonapi-resources/tree/master/tests/dummy/app) included in this repo is a demo of using
ember-jsonapi-resources.

- [config/environment](https://github.com/pixelhandler/ember-jsonapi-resources/tree/master/tests/dummy/config/environment.js#L10-L27)
- [store](https://github.com/pixelhandler/ember-jsonapi-resources/tree/master/tests/dummy/app/routes/index.js#L6-L12)
- [cache](https://github.com/pixelhandler/ember-jsonapi-resources/tree/master/tests/dummy/app/routes/post.js#L6)
- [post model](https://github.com/pixelhandler/ember-jsonapi-resources/tree/master/tests/dummy/app/models/post.js#L5-L15)
- [posts service](https://github.com/pixelhandler/ember-jsonapi-resources/tree/master/tests/dummy/app/services/posts.js)
- [post initializer](https://github.com/pixelhandler/ember-jsonapi-resources/tree/master/tests/dummy/app/initializers/post.js)
- [post adapter](https://github.com/pixelhandler/ember-jsonapi-resources/tree/master/tests/dummy/app/adapters/post.js)
- [post serializer](https://github.com/pixelhandler/ember-jsonapi-resources/tree/master/tests/dummy/app/serializers/post.js)
- [post detail template](https://github.com/pixelhandler/ember-jsonapi-resources/tree/master/tests/dummy/app/templates/post/detail.hbs)
- [post comments template](https://github.com/pixelhandler/ember-jsonapi-resources/tree/master/tests/dummy/app/templates/post/comments.hbs)

See the commit history on this repo, [jr-test], a manual test of using this library
in a new Ember CLI app generated with `ember new jr-test`

[jr-test]: https://github.com/pixelhandler/jr-test