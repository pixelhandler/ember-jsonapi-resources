/*jshint node:true*/
var EOL = require('os').EOL;
var path = require('path');

module.exports = {
  description: 'Generates an dictionary util, use with ember-jsonapi-resources transfrom objects.',

  anonymousOptions: [
    'name',
    'key:value'
  ],

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
      name: name,
      pairs: pairs.join(EOL)
    };
  },

  fileMapTokens: function() {
    return {
      __name__: function (options) {
        var moduleName = options.dasherizedModuleName;
        return moduleName;
      },
      __path__: function(options) {
        return path.join('utils', 'dictionaries');
      }
    };
  }
};

function assignment(key, value) {
  return 'dictionary["' + key + '"] = "' + value + '";';
}
