import Adapter from '../adapters/<%= entity %>';
import ServiceCache from '../mixins/service-cache';

Adapter.reopenClass({ isServiceFactory: true });

export default Adapter.extend(ServiceCache);
