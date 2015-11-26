# Ember JSON API Resources

An [Ember CLI] Addon… a lightweight solution for data persistence in an [Ember.js]
application following the [JSON API] 1.0 specification (your anti-bikeshedding
weapon for API development).

URLs are first class in the JSON API 1.0 specification and first class
in the [Ember.js] Router. Why not make them first class in your persistence
solution too? Now you can with the [ember-jsonapi-resources] addon.

This addon was inspired by finding a simple path to shipping an application
implementing the JSON API spec by using the [JSONAPI::Resources] gem to production.

Whether you adopt the JSON API 1.0 spec or not, this addon is a template for
creating a data persistence solution for your [Ember.js] application that models
the domain of your API server. The addon code is rather concise; borrow at will.

* [Code Documentation][generated docs]
* [Example app](https://github.com/pixelhandler/jr-test)
* [Guide (wiki)](https://github.com/pixelhandler/ember-jsonapi-resources/wiki)

[![Build Status](https://travis-ci.org/pixelhandler/ember-jsonapi-resources.svg?branch=master)](https://travis-ci.org/pixelhandler/ember-jsonapi-resources)
[![Ember Observer Score](http://emberobserver.com/badges/ember-jsonapi-resources.svg)](http://emberobserver.com/addons/ember-jsonapi-resources)
[![npm](https://img.shields.io/npm/dm/ember-jsonapi-resources.svg)](https://www.npmjs.com/package/ember-jsonapi-resources)
[![npm](https://img.shields.io/npm/v/ember-jsonapi-resources.svg)](https://www.npmjs.com/package/ember-jsonapi-resources)
[![Gitter](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/pixelhandler/ember-jsonapi-resources?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge)

## Status

This addon is under active development.

This is a NEW project there may be bugs depending on your use of the addon.
Please do file an issue if you run into a bug.


## Requirements

This data persistence solution for an Ember.js application is a simple approach;
however, there are a few things you'll need to understand in order to get up
and running.

* Familiarity with [Ember.js], [Ember CLI] and [JSON API]
* You must use Ember CLI to use ember-jsonapi-resources, it's an addon
  * You'll need to uninstall Ember Data from the generated application
    and configure your app, see the 'usage' section below.
* Uses [Fetch API] see [Introduction to fetch()] and falls back to XMLHttpRequest
  * A `fetch` polyfill is included with this addon
  * A `FetchMixin` provides an option to `useAjax` if you choose


## Other Ember.js JSON API Implementations

- [Ember Orbit] with [Orbit.js]
- Ember Data with [JSON API Adapter][ember-json-api]

[Ember Orbit]: https://github.com/orbitjs/ember-orbit
[Orbit.js]: https://github.com/orbitjs/orbit.js
[ember-json-api]: https://github.com/kurko/ember-json-api


## Why a Stand-Alone Solution?

This is a simple solution for an Ember app that utilizes resources following
the JSON API 1.0 specification. It operates on the idea that the objects in the
app (resource/model, adapter, serializer, services) simply follow the spec.

URL's are first class in the JSON API 1.0 specification and first class
in the [Ember.js] Router. Why not make them first class in your persistence
solution too?

The [JSON API] specification defines relationships including `links` objects that
providing URLs for `related` and `self`, making your API server discoverable.

This implementation takes the posture that your application's resources do not
need a complex abstraction but a simple implemenation of a solid specification.
So, this project is great for getting started with using the JSON API spec in your
Ember.js app.

Also, managing a distributed cache requires flexibility. When a client application
receives a representation of a resource from a server, the client should be able
to expire that cached object (in the browser application) based on the response
headers; or by whatever means the developer chooses.

[Introduction to fetch()]: http://updates.html5rocks.com/2015/03/introduction-to-fetch
[Fetch API]: https://fetch.spec.whatwg.org
[JSON API]: http://jsonapi.org
[Ember CLI]: http://www.ember-cli.com
[ember-jsonapi-resources]: https://github.com/pixelhandler/ember-jsonapi-resources
[JSONAPI::Resources]: https://github.com/cerebris/jsonapi-resources
[Ember.js]: http://emberjs.com


## Questions

**Is this a replacement for Ember Data or an interface to it?**

**Neither**. This is a completely separate solution. Ember Data needs *foreign keys* 
and provides an abstraction for adaters and serializers. It's solution helps you work 
with various JSON document formats. Ember JSON API Resources needs *URLs* and fits
a specific specification for an API server without the need for an abstraction.

**Does this implement all of the JSON API specification?**

**Most of it**. The happy path for reading, creating, updating/patching, deleting
is ready, as well as patching relationships. No extension support has been worked
on, e.g. [JSON Patch]. I would like to do that one day.

**Is this lightweight? Relative to what?**

**Yes**. With a server that follows the JSON API specification - it just works.
This is a simple solution compared with starting from scratch using AJAX. This
solution provides a basic, (timed) caching solution to minimize requests, and
leaves a more advanced caching strategy to the developer via a mixin. It does
provide a `store` object that caches deserialized resources.

**Are included resources supported (side-loading)?**

**Yes**. When using `?include=relation` in a request for a resource, the (related)
included resources will be deserialized and cached using the `cacheDuration` value
set on the resource prototype (model).

**What does the `store` actually do?**

**Caching, and it behaves as expected in the default `model` hook of a route**. 
The store service is a facade for the services for each resource.
Calling `this.store.find('entity')` in a route's model hook will lookup the service
for that entity and call that service's `find` method. The service is a combination
of an adapter, cache mixin, and associated serializer for the same entity. The service
is an extension of that adapter with a mixin for the caching strategy for that entity.
The default `service-cache` mixin provides a basic caching plan using a time value
for exiration, which is a property of the resource (defaults to 7 minutes).

[JSON Patch]: http://jsonpatch.com/


## Example Application

The [tests/dummy/app](tests/dummy/app) included in this repo is a demo of using
ember-jsonapi-resources.

- [config/environment](tests/dummy/config/environment.js#L10-L27)
- [store](tests/dummy/app/routes/index.js#L6-L12)
- [cache](tests/dummy/app/routes/post.js#L6)
- [post model](tests/dummy/app/models/post.js#L5-L15)
- [posts service](tests/dummy/app/services/posts.js)
- [post initializer](tests/dummy/app/initializers/post.js)
- [post adapter](tests/dummy/app/adapters/post.js)
- [post serializer](tests/dummy/app/serializers/post.js)
- [post detail template](tests/dummy/app/templates/post/detail.hbs)
- [post comments template](tests/dummy/app/templates/post/comments.hbs)

See the commit history on this repo, [jr-test], a manual test of using this library
in a new Ember CLI app generated with `ember new jr-test`

[jr-test]: https://github.com/pixelhandler/jr-test


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

- GET <http://api.pixelhandler.com/api/v1/posts>
- GET <http://api.pixelhandler.com/api/v1/comments>
- GET <http://api.pixelhandler.com/api/v1/authors>
- GET <http://api.pixelhandler.com/api/v1/posts?sort=-date&fields[posts]=title,date&page[offset]=0&page[limit]=20>

The api.pixelhandler.com server is running the [JSONAPI::Resources] gem. It
follows the [JSON API 1.0 spec](http://jsonapi.org).


## Contributing / Development

Clone the repo, install the dependencies:

* `git clone` this repository
* `npm install`
* `bower install`

### Running

To run the app in /tests/dummy use a proxy url for a live API

* `ember server --proxy http://api.pixelhandler.com`
* Visit <http://localhost:4200>.

### Running Tests

* `ember test`
* `ember test --server`
* `ember test --server -m 'Unit | Mixin | service cache'`
* `ember test --server --filter 'cacheUpdate'`

A good way to get to know more about how this addon works is to review the tests,
see source code for the unit tests: [tests/unit](tests/unit).

### Building

* `ember build`

For more information on using ember-cli, visit [http://www.ember-cli.com/]

[http://www.ember-cli.com/]: http://www.ember-cli.com/


## Documentation

Online documentation, build from source: [generated docs]

Docs are generated from source using [yuidoc].

To view the docs during development:

* `yuidoc ./addon/* -c yuidoc.json --server 3333` (you can append a port number e.g. `--server 8888`, the default port is 3000)

To generate docs for the gh-pages branch:

* `yuidoc ./addon/* -c yuidoc.json`

[generated docs]: http://pixelhandler.github.io/ember-jsonapi-resources/docs
[yuidoc]: https://github.com/yui/yuidoc
