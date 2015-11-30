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