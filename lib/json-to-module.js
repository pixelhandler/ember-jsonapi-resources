/* jshint node: true */
var Filter = require('broccoli-filter');

function JsonToModule (inputTree, options) {
  if (!(this instanceof JsonToModule)) {
    return new JsonToModule(inputTree);
  }
  Filter.call(this, inputTree, options);
  options = options || {};
}

JsonToModule.prototype = Object.create(Filter.prototype);
JsonToModule.prototype.constructor = JsonToModule;
JsonToModule.prototype.extensions = ['json'];
JsonToModule.prototype.targetExtension = 'js';

JsonToModule.prototype.processString = function (string) {
  return 'export default ' + string + ';';
};

module.exports = JsonToModule;
