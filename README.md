# Ember JSON API Resources (an Ember CLI Addon)

Lightweight persistence for an Ember CLI application following the [JSON API] 1.0 
specification (your anti-bikeshedding weapon for API development).

[JSON API]: http://jsonapi.org

For example code see the 'tests/dummy' app in this repo.


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

Perhaps consider a solution for buffering changes on the resource that
is passed into a component using [ember-state-services] and [ember-buffered-proxy]; or just re-define the resource's adapter prototype so that `initEvents` returns a no-op instead of listening for the 'attributeChanged' event.

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


## Why a Stand-alone solution?

This addon was extracted from my blog app that uses the JSONAPI::Resources gem 
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

[JSONAPI::Resources]: https://github.com/cerebris/jsonapi-resources


### Other Emer JSON API implementations

- [Ember Orbit]: https://github.com/orbitjs/ember-orbit
- Ember Data with [JSON API Adapter][ember-json-api]

[Ember Orbit]: https://github.com/orbitjs/ember-orbit
[ember-json-api]: https://github.com/kurko/ember-json-api


### Status of the project

This addon will be under active development, so it will be fully documented and tested within a week or two.

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
