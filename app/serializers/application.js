import TransformsMixin from '../mixins/transforms';
import ApplicationSerializer from 'ember-jsonapi-resources/serializers/application';

/**
  Serializer for a JSON API resource, combines the addon ApplicationSerializer and TransformsMixin

  @class ApplicationSerializer
  @uses TransformsMixin
*/
export default ApplicationSerializer.extend(TransformsMixin);
