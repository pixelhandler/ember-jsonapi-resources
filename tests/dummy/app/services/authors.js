import Adapter from '../adapters/author';
import ServiceCache from 'ember-jsonapi-resources/mixins/service-cache';

Adapter.reopenClass({ isServiceFactory: true });

export default Adapter.extend(ServiceCache);
