import Adapter from '../adapters/author';
import ServiceCache from '../mixins/service-cache';

Adapter.reopenClass({ isServiceFactory: true });

export default Adapter.extend(ServiceCache);
