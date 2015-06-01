import Adapter from '../adapters/post';
import ServiceCache from 'ember-jsonapi-resources/mixins/service-cache';

export default Adapter.extend(ServiceCache);
