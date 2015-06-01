import Adapter from '../adapters/<%= entity %>';
import ServiceCache from 'ember-jsonapi-resources/mixins/service-cache';

export default Adapter.extend(ServiceCache);
