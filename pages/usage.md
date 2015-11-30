## Usage

Below are notes on using the ember-jsonapi-resources addon…

### Installation

You will need to remove another dependency that injects a `store` service.

To consume this addon in an Ember CLI application:

    ember install ember-jsonapi-resources

Remove dependency for Ember Data in your ember-cli app:

    npm rm ember-data --save-dev
    bower uninstall ember-data --save

Remove ember-data from both bower.json and package.json then:

    bower install
    npm install

### Resource Generator

Generate a resource (model with associated adapter, serializer and service):

    ember generate jsonapi-resource entityName

Use the singular form of the name for your resource (entityName).

The blueprint for a `jsonapi-resource` does not generate a route.
You can generate a route using the same name or use a different name that
represents the user interface:

    ember generate route entityName

The arguments are passed to the `jsonapi-model` blueprint so that `attr`,
`has-one`, and `has-many` computed properties can be generated.

    ember generate jsonapi-resource article title:string version:number author:has-one:user

If you are using the pod file structure in your ember-cli project use the `--pod`
argument with your generator.

    ember generate jsonapi-resource user name:string articles:has-many:articles --pod

For generated code examples, see the [tests/dummy/app](tests/dummy/app) in this repo.

### Store Service

A `store` service is injected into the routes. This is similar to how
[Ember Data](https://github.com/emberjs/data) uses a `store`, but the `resource`
is referenced in the plural form (like your API endpoint).

[This is the interface for the `store`](/addon/services/store.js) which is a facade 
for the service for a specific `resource`. Basically you call the `store` methods
and pass in the `resource` name, e.g. 'posts' which interacts with the service for 
your `resource`.

An example `route`:

```javascript
import Ember from 'ember';

export default Ember.Route.extend({
  model() {
    return this.store.find('post');
  }
});
```

The store object will pluralize the type to lookup the resources' service objects.

### Resource Services

Each `resource` has an associated service that is used by the `store`.

A `resource` service is a combination of an `adapter`, `serializer` and `cache` 
object. The `service` is also injected into the `resource` (model) objects.

The caching plan for a service is simply a mixin that can be easily customized.
To begin with, the `resource` (model) prototype and the `service-cache` mixin
work together to provide a basic plan.

The services are "evented" to facilitate close to real time updates.

An `attr` of the resource is a computed property to the actual attribute in an 
`attributes` hash on the `resource` (model) instance. Using `attr()` supports
any type, and an optional `type` (String) argument can be used to enforce
setting and getting with a specific type. `'string'`, `'number'`, `'boolean'`,
`'date'`, `'object'`, and `'array'` are all valid types for attributes.

When an `attr` is `set` and the value has changed an `attributeChanged` event
is triggered on the `resource`'s service object. By default, the adapter listens
to this event and handles it with a call to `updateResource`.

The `resource` `adapter`'s `updateResource` method sends a PATCH request with
only the data for the changed attributes.

You might want to buffer changes on the resource that is passed into a component 
using [ember-state-services] and [ember-buffered-proxy], or you could just
re-define the `resource`'s `adapter` prototype so that `initEvents` returns
a noop instead of listening for the `attributeChanged` event.

[ember-state-services]: https://github.com/stefanpenner/ember-state-services
[ember-buffered-proxy]: https://github.com/yapplabs/ember-buffered-proxy

### Resource (Model)

Here is the blueprint for a `resource` (model) prototype:

```javascript
import Ember from 'ember';
import Resource from './resource';
import { attr, hasOne, hasMany } from 'ember-jsonapi-resources/models/resource';

export default Resource.extend({
  type: '<%= resource %>',
  service: Ember.inject.service('<%= resource %>'),

  /* You can generate properties using arguments to the jsonapi-model blueprint…
  title: attr('string'),
  published: attr('date'),
  tags: attr('array'),
  footnotes: attr('object'),
  revisions: attr()
  version: attr('number'),
  "is-approved": attr('boolean'),

  author: hasOne('author'),
  comments: hasMany('comments')
  */
});
```

The commented out code includes an example of how to setup the relationships
and define your attributes. `attr()` can be used for any valid type, or you can
specify a type, e.g. `attr('string')` or `attr('date')`. An attribute that is
defined as a `'date'` type has a built in transform method to serialize and
deserialize the date value. Typically the JSON value for a Date object is
communicated in ISO format, e.g. "2015-08-25T22:05:37.393Z". The application
serializer has methods for [de]serializing the date values between client and
server. You can add your own transform methods based on the type of the
attribute or based on the name of the attribute, the transform methods based on
the name of the attribute will be called instead of any transform methods based
on the type of the attribute.

The relationships are async using promise proxy objects. So when a template accesses 
the `resource`'s relationship a request is made for the relation.

### Configuration

You may need configure some paths for calling your API server.

Example config settings: [tests/dummy/config/environment.js](tests/dummy/config/environment.js)

```javascript
var ENV = {
// …
  APP: {
    API_HOST: '/',
    API_HOST_PROXY: 'http://api.pixelhandler.com/',
    API_PATH: 'api/v1',
  },
  contentSecurityPolicy: {
    'connect-src': "'self' api.pixelhandler.com localhost:3000",
  }
// …
};
```

`MODEL_FACTORY_INJECTIONS` should be set to `true` in the app/app.js file.

Also, once you've generated a `jsonapi-adapter` you can customize the URL.

See this example: [tests/dummy/app/adapters/post.js](tests/dummy/app/adapters/post.js)

```javascript
import ApplicationAdapter from './application';
import config from '../config/environment';

export default ApplicationAdapter.extend({
  type: 'post',

  url: config.APP.API_PATH + '/posts',

  fetchUrl: function(url) {
    const proxy = config.APP.API_HOST_PROXY;
    const host = config.APP.API_HOST;
    if (proxy && host) {
      url = url.replace(proxy, host);
    }
    return url;
  }
});
```

The example above also includes a customized method for the url. In the case where 
your API server is running on it's own domain and you use a proxy with your nginx 
server to access the API server on your same domain at `/api` then the JSON documents 
may have it's own link references to the original server so you can replace the URL 
as needed to act as if the API server is running on your same domain.

#### Authorization

By default credentials stored at `localStorage['AuthorizationHeader']` will be used.
If you'd like to change this, for instance to make it work with `ember-simple-auth`,
there's a [configurable mixin available](https://github.com/pixelhandler/ember-jsonapi-resources/wiki/Authorization).

#### Example JSON API 1.0 Document

```javascript
{
  "data": [{
    "type": "articles",
    "id": "1",
    "attributes": {
      "title": "JSON API paints my bikeshed!"
    },
    "links": {
      "self": "http://example.com/articles/1"
    },
    "relationships": {
      "author": {
        "links": {
          "self": "http://example.com/articles/1/relationships/author",
          "related": "http://example.com/articles/1/author"
        },
        "data": { "type": "people", "id": "9" }
      },
      "comments": {
        "links": {
          "self": "http://example.com/articles/1/relationships/comments",
          "related": "http://example.com/articles/1/comments"
        },
        "data": [
          { "type": "comments", "id": "5" },
          { "type": "comments", "id": "12" }
        ]
      }
    }
  }]
}
```

For more examples see my API's resources:

GET /api/v1/posts

```bash
curl -i -H "Accept: application/vnd.api+json" -H "Content-Type: application/vnd.api+json" -X GET http://api.pixelhandler.com/api/v1/posts
```

GET /api/v1/comments

```bash
curl -i -H "Accept: application/vnd.api+json" -H "Content-Type: application/vnd.api+json" -X GET http://api.pixelhandler.com/api/v1/comments
```

GET /api/v1/authors

```bash
curl -i -H "Accept: application/vnd.api+json" -H "Content-Type: application/vnd.api+json" -X GET http://api.pixelhandler.com/api/v1/authors
```

GET /api/v1/posts with params for sort, fields, pagination

```bash
curl -i -H "Accept: application/vnd.api+json" -H "Content-Type: application/vnd.api+json" -X GET "http://api.pixelhandler.com/api/v1/posts?sort=-date&amp;fields%5Bposts%5D=title,date&amp;page%5Boffset%5D=0&amp;page%5Blimit%5D=5"
```

The api.pixelhandler.com server is running the [JSONAPI::Resources] gem. It
follows the [JSON API 1.0 spec](http://jsonapi.org).


