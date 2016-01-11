import { module, test } from 'qunit';
import <%= transformName %> from '<%= transformPath %>';
import dictionary from '<%= dictionaryPath %>';

module('<%= friendlyTestDescription %>');

test('<%= transformName %>#serialize', function(assert) {
  let value;
  for (let key in dictionary) {
    value = <%= transformName %>.serialize(dictionary[key]);
    assert.equal(value, key, 'serialize("'+ dictionary[key] +'") is `' + key + '`');
  }
});

test('<%= transformName %>#deserialize', function(assert) {
  let value;
  for (let key in dictionary) {
    value = <%= transformName %>.deserialize(key);
    assert.equal(value, dictionary[key], 'deserialize("'+ key +'") is `' + dictionary[key] +'`');
  }
});
