import <%= camelizedModuleName %> from '../../../../utils/dictionaries/<%= dasherizedModuleName %>';
import { module, test } from 'qunit';

module('<%= friendlyTestName %>');

// Replace this with your real tests.
test('<%= camelizedModuleName %> dictionary exists', function(assert) {
  assert.ok(<%= camelizedModuleName %>, '<%= camelizedModuleName %> ok');

  let dictionary = {
<%= pairs %>
  };
  let keys = Object.keys(dictionary);
  let values = keys.map(function(key) { return dictionary[key]; });

  for (let i = 0; i < keys.length; i++) {
    let key = keys[i];
    let value = values[i];
    assert.ok(!!<%= camelizedModuleName %>[key], `${key} is a key`);
    assert.equal(<%= camelizedModuleName %>[key], value, `<%= camelizedModuleName %>[${key}] is ${value}`);
  }
});
