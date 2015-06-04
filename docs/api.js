YUI.add("yuidoc-meta", function(Y) {
   Y.YUIDoc = { meta: {
    "classes": [
        "ApplicationAdapter",
        "ApplicationSerializer",
        "RelatedProxyUtil",
        "Resource",
        "StoreService"
    ],
    "modules": [
        "adapter",
        "cache",
        "ember-jsonapi-resources",
        "resource",
        "serializer",
        "store"
    ],
    "allModules": [
        {
            "displayName": "adapter",
            "name": "adapter",
            "description": "Adapter for a JSON API endpoint, use as a service for your backend"
        },
        {
            "displayName": "cache",
            "name": "cache"
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
        }
    ]
} };
});