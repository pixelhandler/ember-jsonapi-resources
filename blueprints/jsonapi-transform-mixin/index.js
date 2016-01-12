/*jshint node:true*/
var inflector = require('inflection');
var stringUtil = require('ember-cli-string-utils');
var EOL = require('os').EOL;

module.exports = {
  description: 'Generates an mixin for using value transforms w/ ember-jsonapi-resources serializers.',

  anonymousOptions: ['name', 'attr-name'],

  locals: function(options) {
    var entity = options.args[1];
    var attrNames = Object.keys(options.entity.options);
    var attrName, imports = [], methods = [];

    for (var i = 0; i < attrNames.length; i++) {
      attrName = attrNames[i];
      imports.push( makeImport(attrName) );
      methods.push( makeTransformMethods(attrName) );
    }

    return {
      imports: imports.join(EOL),
      methods: methods.join(',' + EOL + EOL)
    };
  },

  fileMapTokens: function() {
    return {
      __name__: function (options) {
        return options.dasherizedModuleName + '-transforms';
      },
      __path__: function(options) {
        return inflector.pluralize(options.originBlueprintName.replace('jsonapi-transform-', ''));
      }
    };
  }
};

function makeImport(attrName) {
  var transformName = makeTransformName(attrName);
  var dasherized = stringUtil.dasherize(attrName);
  return "import " + transformName + " from '../transforms/" + dasherized + "';";
}

function makeTransformMethods(attrName) {
  return [ makeDeserializeMethod(attrName), makeSerializeMethod(attrName) ].join(',' + EOL + EOL);
}

function makeSerializeMethod(attrName) {
  var camelized = stringUtil.camelize(attrName);
  var methodName = 'serialize'+ stringUtil.classify(attrName) + 'Attribute';
  var transformName = makeTransformName(attrName);
  var loc = [];
  loc.push('  ' + methodName + '(deserialized) {');
  loc.push('    ' + 'return ' + transformName + '.serialize(deserialized);');
  loc.push('  }');
  return loc.join(EOL);
}

function makeDeserializeMethod(attrName) {
  var camelized = stringUtil.camelize(attrName);
  var methodName = 'deserialize'+ stringUtil.classify(attrName) + 'Attribute';
  var transformName = makeTransformName(attrName);
  var loc = [];
  loc.push('  ' + methodName + '(serialized) {');
  loc.push('    ' + 'return ' + transformName + '.deserialize(serialized);');
  loc.push('  }');
  return loc.join(EOL);
}

function makeTransformName(attrName) {
  return stringUtil.camelize(attrName) + 'Transform';
}
