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
creating a data persitence solution for your [Ember.js] application that models
the domain of your API server. The addon code is rather concise; borrow at will.


## Status

**This is a pre-release**.

![Travis Build Status](https://travis-ci.org/pixelhandler/ember-jsonapi-resources.svg "Build Status")

This addon will be under active development, so it will be fully documented and 
tested within a week or two.

**This is a NEW project there may be bugs depending on your use of the addon.** 
Please do file an issue if you run into a bug.


## Requirements

This data persistence solution for an Ember.js application is a simple approach;
however, there are a few things you'll need to understand in order to get up and running.

* Familiarity with [Ember.js], [Ember CLI] and [JSON API]
* You must use Ember CLI to use ember-jsonapi-resources, it's an addon
  * You'll need to uninstall Ember Data from the generated application
    and configure your app, see the 'usage' section below.
* [Fetch API] instead of XMLHttpRequest, see [Introduction to fetch()]
  * A polyfill is included in this addon


## Other Ember.js JSON API Implementations

- [Ember Orbit] with [Orbit.js]
- Ember Data with [JSON API Adapter][ember-json-api]

[Ember Orbit]: https://github.com/orbitjs/ember-orbit
[Orbit.js]: https://github.com/orbitjs/orbit.js
[ember-json-api]: https://github.com/kurko/ember-json-api


## Why a Stand-Alone Solution?

URL's are first class in the JSON API 1.0 specification and first class
in the [Ember.js] Router. Why not make them first class in your persistence
solution too?

The [JSON API] specification defines relationships including `links` objects that
providing URLs for `related` and `self`, making your API server discoverable.

This implementation takes the posture that your application's resources do not need a 
complex abstraction but a simple implemenation of a solid specification. So this 
project is great for getting started with using the JSON API spec in your Ember.js app.

This addon was extracted from my blog app that uses the [JSONAPI::Resources] gem
(running on the master branch for now). The blog app has auth for admin and
commenting and resources for posts, authors, comments, commenters using relations
for hasOne and hasMany.

This is a simple solution for an Ember app that utilizes resources following
the JSON API 1.0 specification. It operates on the idea that the objects in the app 
(resource/model, adapter, serializer, services) simply follow the spec.

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
with various JSON document formats. Ember JSON API Resources needs *URLs* and fits a
specific specification for an API server without the need for an abstraction.

**Does this implement all of the JSON API specification?**

**Not yet**. The happy path for reading, creating, updating/patching, deleting is 
ready, as well as patching relationships. No extension support has been worked on, 
e.g. [JSON Patch]. I would like to do that one day.

**Is this lightweight? Relative to what?**

**Yes** With a server that follows the JSON API specification - it just works. This is a 
simple solution compared with starting from scratch using AJAX, or adapting Ember Data 
to work with the URLs. This solution leaves the caching strategy to the developer. It 
does provide a `store` object that caches deserialized resources.

**I've installed the app and I see a lot of requests in the browser console,
is that normal?**

**Yes**. For now, I trust that the browser is fine with 304 responses. More cache 
lookups will be added soon.

[JSON Patch]: http://jsonpatch.com/


## Usage

Below are notes on using the ember-jsonapi-resources addon…

### Installation

You will need to remove another dependency that injects a `store` service.

To consume this addon in an Ember CLI application:

    ember install ember-jsonapi-resources

Remove dependency for Ember Data in your ember-cli app:

    npm rm ember-data --save-dev

Remove ember-data from both bower.json and package.json then:

    bower install
    npm install


### Resource Generator

Generate a resource (model with associated adapter, serializer and service):

    ember generate resource entityName

Use the singular form of the name for your resource (entityName).

The blueprint for a `resource` re-defines the Ember CLI `resource` generator.
So you'll need to generate an associated route like so:

    ember generate route entityName

For generated code exampels, see the [tests/dummy/app](tests/dummy/app) in this repo.

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

The services are "evented" to facilitate close to real time updates.

An `attr` of the resource is a computed property to the actual attribute in an 
`attributes` hash on the `resource` (model) instance.

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
import Resource from 'ember-jsonapi-resources/models/resource';
import { attr, hasOne, hasMany } from 'ember-jsonapi-resources/models/resource';

export default Resource.extend({
  type: '<%= entity %>',
  service: Ember.inject.service('<%= resource %>'),

  /*
  title: attr(),
  date: attr(),

  author: hasOne('author'),
  comments: hasMany('comments')
  */
});
```

The commented out code is an example of how to setup the relationships.

The relationships are async using promise proxy objects. So when a template accesses 
the `resource`'s relationship a request is made for the relation.

### Configuration

You may need configure some paths for calling your API server.

Example config settings: [tests/dummy/config/environment.js](tests/dummy/config/environment.js)

```javascript
var ENV = {
// …
  EmberENV: {
    MODEL_FACTORY_INJECTIONS: true
  },
  APP: {
    API_HOST: '/',
    API_HOST_PROXY: 'http://api.pixelhandler.com/',
    API_PATH: 'api/v1',
  },
  contentSecurityPolicy: {
    'connect-src': "'self' api.pixelhandler.com",
  }
// …
};
```

Also, once you've generated a `resource` you can assign the URL.

See this example: [tests/dummy/app/adapters/post.js](tests/dummy/app/adapters/post.js)

```javascript
import ApplicationAdapter from 'ember-jsonapi-resources/adapters/application';
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

This will be worked on shortly. The first test was to deploy to a working app, a demo of 
which is available on <http://pixelhandler.com>. I promise to write more tests this week.

* `ember test`
* `ember test --server`

### Building

* `ember build`

For more information on using ember-cli, visit [http://www.ember-cli.com/]

[http://www.ember-cli.com/]: http://www.ember-cli.com/

### Roadmap

- Finish writing the tests.
- Use cache service for relations in the resource (model).
- Deserialize and cache the 'include' resource of a document.
- Figure out the rest as implemented in a complex app with lots of reads & writes.
