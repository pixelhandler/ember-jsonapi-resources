## About

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

[Introduction to fetch()]: http://updates.html5rocks.com/2015/03/introduction-to-fetch
[Fetch API]: https://fetch.spec.whatwg.org
[JSON API]: http://jsonapi.org
[Ember CLI]: http://www.ember-cli.com
[ember-jsonapi-resources]: https://github.com/pixelhandler/ember-jsonapi-resources
[JSONAPI::Resources]: https://github.com/cerebris/jsonapi-resources
[Ember.js]: http://emberjs.com