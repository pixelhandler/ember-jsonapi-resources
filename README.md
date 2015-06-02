# Ember JSON API Resources

An [Ember CLI] Addon… a lightweight solution for data persistence for an Ember CLI
application following the [JSON API] 1.0 specification (your anti-bikeshedding
weapon for API development).

For example code see the 'tests/dummy' app in this repo.

This solution uses the [Fetch API] instead of XMLHttpRequest,
see [Introduction to fetch()].

URL's are first class in the JSON API 1.0 specification and first class
in the [Ember.js] Router. Why not make them first class in your persistence
solution too? Now you can with the [ember-jsonapi-resources] addon.

This addon was inspired by finding the quickest path to shipping an a
application using the [JSONAPI::Resources] to production.

Whether you adopt the JSON API 1.0 spec, or not; this addon is a template for
creating a data persitence solution for your [Ember.js] application that models
the domain of your API server.


[Introduction to fetch()]: http://updates.html5rocks.com/2015/03/introduction-to-fetch
[Fetch API]: https://fetch.spec.whatwg.org
[JSON API]: http://jsonapi.org
[Ember CLI]: http://www.ember-cli.com
[ember-jsonapi-resources]: https://github.com/pixelhandler/ember-jsonapi-resources
[JSONAPI::Resources]: https://github.com/cerebris/jsonapi-resources
[Ember.js]: http://emberjs.com


## Installation

To consume this addon in an Ember CLI application:

    ember install ember-jsonapi-resources


## Resource Generator

Generate a resource (model with associated adapter, serializer and service)

    ember generate resource entityName

The blueprint for a 'resource' re-defines the Ember CLI 'resource' generator.
So you'll need to generate an associated route like so:

    ember generate route entityName


## Store Service

To be compatible with the default behavior in the Ember Route model
hook, a `store` service is injected into the routes.

This is the interface for the store: [/addon/services/store.js] which is
a facade for the service for a specific resource. Basically you call the
store methods and pass in the resource name, e.g. 'posts' which
interacts with the service for your resource.


## Resource Services

Each resource has an associated service that's uses by the `store`.

A resource service is a combination of an `adapter`, `serializer`
and `cache` object. The `service` is also injected into the resource
(model) objects.

The services are "evented" to facilitate close to real time updates.

An `attr` of the resource is a computed property to the actual attribute
in an `attributes` hash on the resource (model) instance. 

When an `attr` is `set` and the value has changed an `attributeChanged` 
event is triggered on the resources service object by default the
adapter listens to this event and handles with a call to `updateResource`.

The resource adapter's `updateResource` method sends a PATCH request
with only the data for the changed attributes.

Perhaps consider a solution for buffering changes on the resource that is
passed into a component using [ember-state-services] and [ember-buffered-proxy];
or just re-define the resource's adapter prototype so that `initEvents` returns
a no-op instead of listening for the 'attributeChanged' event.

[ember-state-services]: https://github.com/stefanpenner/ember-state-services
[ember-buffered-proxy]: https://github.com/yapplabs/ember-buffered-proxy


## Resource (Model)

Here is the blueprint for a resource (model) prototype:

```javascript
import Resource from 'ember-jsonapi-resources/models/resource';
import { attr, hasOne, hasMany, hasRelated } from 'ember-jsonapi-resources/models/resource';

export default Resource.extend({
  type: '<%= entity %>'

  /*
  title: attr(),
  date: attr(),

  relationships: hasRelated('author', 'comments'),
  author: hasOne('author'),
  comments: hasMany('comments')
  */
});
```

The commented out code is an example of how to setup the relationships.

The relationships are asyc using promise proxy objects. So when a
template accesses the model's relationsip a request is made for
relation.


## Configuration

You may need configure some paths for calling your API server.

Example config settings [/tests/dummy/config/environment.js]

```javascript
APP: {
  API_HOST: '',
  API_HOST_PROXY: '',
  API_PATH: 'api/v1',
},
contentSecurityPolicy: {
  'connect-src': "'self' api.pixelhandler.com",
}
```

Also, once you've generated a resource you can assign the URL.

See this example [/tests/dummy/app/adapters/post.js]

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

The example above also includes a customized method for the url. In the
case where your API server is running on it's own domain and you use a
proxy with your nginx server to access the API server on your same
domain at /api then the JSON documents may have it's own link references
to the original server so you can replace the URL as needed to act as if
the API server is running on your same domain.


## Why A Stand-Alone Solution?

URL's are first class in the JSON API 1.0 specification and first class
in the [Ember.js] Router. Why not make them first class in your persistence
solution too?

The [JSON API] spec defines relationships with `links` objects the make each
JSON document discoverable, providing URLs for `related` and `self`.

This implementation takes the posture that your application's resources
to not need a complex abstraction but a simple implemenation of a solid
specification. So not only is this project great for getting started
with using the JSON API spec in your Ember.js app

This addon was extracted from my blog app that uses the [JSONAPI::Resources] gem 
(running on master branch for now). The blog app has auth for admin and 
commenting and resources for posts, authors, comments, commenters using relations 
for hasOne and hasMany.

This is a simple solution for an Ember app that utilizes resources following the 
JSON API 1.0 spec. that operates on the idea that the objects in the app are 
aware that they follow the spec, the model (resource), adapter, serializer and 
services just plainly follow the spec.

I still need to document the project; e.g. how to use the ember generator for a 
"resource". Then update the blog app to use the addon. What' I'm saying is that 
the code works on a production app it's just not fully extracted into a working 
addon yet.


### Example JSON API 1.0 Document

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

For more examples see my API's resources

A JSON API following the spec at <http://jsonapi.org>

- GET <http://api.pixelhandler.com/api/v1/posts>
- GET <http://api.pixelhandler.com/api/v1/comments>
- GET <http://api.pixelhandler.com/api/v1/authors>
- GET <http://api.pixelhandler.com/api/v1/posts?sort=-date&fields[posts]=title,date&page[offset]=0&page[limit]=20>

The api.pixelhandler.com server is running the [JSONAPI::Resources] gem.


### Other Ember.js JSON API Implementations

- [Ember Orbit]
- Ember Data with [JSON API Adapter][ember-json-api]

[Ember Orbit]: https://github.com/orbitjs/ember-orbit
[ember-json-api]: https://github.com/kurko/ember-json-api


### Status of the Project

This addon will be under active development, so it will be fully documented and
tested within a week or two.

#### ROADMAP

- Use service cache for relations in the resource (model)
- Deserialize and cache the 'include' resource of a document
- Figure out the rest as implmented in a complex app with lots of reads
  and writes.


### Contributing / Development

Clone the repo, install the dependencies:

* `git clone` this repository
* `npm install`
* `bower install`

## Running

To run the app in /tests/dummy use a proxy url for a live API

* `ember server --proxy http://api.pixelhandler.com`
* Visit <http://localhost:4200>.

## Running Tests

* `ember test`
* `ember test --server`

## Building

* `ember build`

For more information on using ember-cli, visit [http://www.ember-cli.com/](http://www.ember-cli.com/).
