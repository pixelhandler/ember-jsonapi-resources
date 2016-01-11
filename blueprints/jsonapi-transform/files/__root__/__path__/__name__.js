import TransformMap from 'ember-jsonapi-resources/utils/transform-map';
import dictionary from '<%= dictionaryPath %>';

class <%= className %> extends TransformMap {

  deserialize(serialized) {
    return this.lookup(serialized);
  }

  serialize(deserialized) {
    return this.lookup(deserialized, 'values');
  }

}

export default new <%= className %>(dictionary);
