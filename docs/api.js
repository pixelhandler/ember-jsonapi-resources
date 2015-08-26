YUI.add("yuidoc-meta", function(Y) {
   Y.YUIDoc = { meta: {
    "classes": [
        "ApplicationAdapter",
        "ApplicationSerializer",
        "AuthorizationMixin",
        "RelatedProxyUtil",
        "Resource",
        "ServiceCacheMixin",
        "StoreService",
        "TransformDateAttribute",
        "TransformsMixin"
    ],
    "modules": [
        "adapter",
        "authorization",
        "cache",
        "ember-jsonapi-resources",
        "resource",
        "serializer",
        "store",
        "transforms",
        "utils"
    ],
    "allModules": [
        {
            "displayName": "adapter",
            "name": "adapter",
            "description": "Adapter for a JSON API endpoint, use as a service for your backend"
        },
        {
            "displayName": "authorization",
            "name": "authorization",
            "description": "A Mixin class for storage of credential/token uses with a HTTP Authorization request-header\n\nThe default solution is to use localStorage['AuthorizationHeader'] for the credential"
        },
        {
            "displayName": "cache",
            "name": "cache",
            "description": "A Mixin class for caching JSON API resource objects"
        },
        {
            "displayName": "ember-jsonapi-resources",
            "name": "ember-jsonapi-resources"
        },
        {
            "displayName": "resource",
            "name": "resource",
            "description": "A Resource class to create JSON API resource objects\n\nSee <http://jsonapi.org/format/#document-resource-objects>"
        },
        {
            "displayName": "serializer",
            "name": "serializer",
            "description": "Serializer/Deserializer for a JSON API resource object, used by adapter.\n\nWhen extending use a mixin or define transform methods to serialize and/or\ndeserializer attributes based on the name or the type of attribute.\n\nThe methods use a naming convention:\n\n  - '[de]serialize' + 'AttrName' or 'TypeName' + 'Attribute'\n  - E.g. use `serializeNameAttribute` and `deserializeNameAttribute` in\n    a generated serializer for use with `name: attr()`\n  - Or, redefine `serializeDateAttribute` and `deserializeDateAttribute`\n    to use your own data transformation with `attr('date')` the default,\n    Date type [de]serialize methods transfrom to/from ISO Format.\n  - Transform methods based on the name of the attribute will be called\n    instead of any transform methods based on the type of the attribute."
        },
        {
            "displayName": "store",
            "name": "store",
            "description": "Service for a JSON API endpoint a facade to your resource adapter"
        },
        {
            "displayName": "transforms",
            "name": "transforms",
            "description": "A Mixin class for methods to transform resource attributes, includes date\nattribute methods to serialize and deserialize the date(time) to/from\nISO Format for use with `attr('date')`\n\nAny valid attribute type (string, boolean, number, object, array, date) can\nbe added to your app, just generate a transforms mixin and define other\ntypes if needed, and use the type when defining a resource attribute,\ne.g. attr('array')"
        },
        {
            "displayName": "utils",
            "name": "utils",
            "description": "Utility for creating promise proxy objects for related resources"
        }
    ]
} };
});