YUI.add("yuidoc-meta", function(Y) {
   Y.YUIDoc = { meta: {
    "classes": [
        "ApplicationAdapter",
        "ApplicationSerializer",
        "AuthorizationMixin",
        "RelatedProxyUtil",
        "Resource",
        "ServiceCacheMixin",
        "StoreService"
    ],
    "modules": [
        "adapter",
        "authorization",
        "cache",
        "ember-jsonapi-resources",
        "resource",
        "serializer",
        "store",
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
            "description": "Serializer/Deserializer for a JSON API resource object, used by adapter"
        },
        {
            "displayName": "store",
            "name": "store",
            "description": "Service for a JSON API endpoint a facade to your resource adapter"
        },
        {
            "displayName": "utils",
            "name": "utils",
            "description": "Utility for creating promise proxy objects for related resources"
        }
    ]
} };
});