/*jshint node:true*/
var EOL = require('os').EOL;
var testInfo = require('ember-cli-test-info');

module.exports = {
  description: 'Generates a dictionary util unit test.',
  locals: function(options) {
    var name = options.args[1];
    var entries = options.entity.options;
    var key, value, entry;
    var pairs = [];

    for (key in entries) {
      if (entries.hasOwnProperty(key)) {
        value = entries[key];
        pairs.push(assignment(key, value));
      }
    }
    return {
      friendlyTestName: testInfo.name('dictionary/' + options.entity.name, "Unit", "Utility"),
      pairs: pairs.join(',' + EOL)
    };
  }
};

function assignment(key, value) {
  return '    "' + key + '": "' + value + '"';
}
