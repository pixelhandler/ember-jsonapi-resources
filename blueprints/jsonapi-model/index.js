/*jshint node:true*/
var inflection = require('inflection');
var stringUtils = require('ember-cli-string-utils');
var EOL = require('os').EOL;

module.exports = {
  description: 'Generates an (ember-jsonapi-resource) model following the JSON API 1.0 spec.',

  anonymousOptions: [
    'name',
    'attr:type'
  ],

  locals: function(options) {
    var resource = options.entity.name || options.args[1];
    var attrs = [];
    var needs = [];
    var entityOptions = options.entity.options;

    for (var name in entityOptions) {
      var type = entityOptions[name] || '';
      var foreignModel = name;
      if (type.indexOf(':') > -1) {
        foreignModel = type.split(':')[1];
        type = type.split(':')[0];
      }
      var dasherizedName = stringUtils.dasherize(name);
      var dasherizedType = stringUtils.dasherize(type);
      var dasherizedForeignModel = stringUtils.dasherize(foreignModel);
      var dasherizedForeignModelSingular = inflection.singularize(dasherizedForeignModel);

      var attr;
      if (/has-many/.test(dasherizedType)) {
        var dasherizedNamePlural = inflection.pluralize(dasherizedName);
        attr = resourceAttr(dasherizedForeignModelSingular, dasherizedType);
        attrs.push('"' + dasherizedNamePlural + '": ' + attr);
      } else if (/has-one/.test(dasherizedType)) {
        attr = resourceAttr(dasherizedForeignModel, dasherizedType);
        attrs.push('"' + dasherizedName + '": ' + attr);
      } else {
        attr = resourceAttr(dasherizedName, dasherizedType);
        attrs.push('"' + dasherizedName + '": ' + attr);
      }

      if (/has-many|has-one/.test(dasherizedType)) {
        needs.push("'model:" + dasherizedForeignModelSingular + "'");
      }
    }
    var needsDeduplicated = needs.filter(function(need, i) {
      return needs.indexOf(need) === i;
    });

    attrs = attrs.join(',' + EOL + '  ');
    needs = '  needs: [' + needsDeduplicated.join(', ') + '],';

    return {
      attrs: attrs,
      needs: needs,
      entity: stringUtils.dasherize(inflection.singularize(resource)),
      resource: stringUtils.dasherize(inflection.pluralize(resource))
    };
  },

  fileMapTokens: function() {
    return {
      __name__: function (options) {
        if (options.pod) {
          return 'model';
        }
        var moduleName = options.dasherizedModuleName;
        return moduleName;
      },
      __path__: function(options) {
        if (options.pod && options.hasPathToken) {
          var moduleName = options.dasherizedModuleName;
          return [ options.podPath, moduleName ].join('/');
        }
        var blueprintName = options.originBlueprintName.replace('jsonapi-', '');
        if (blueprintName === 'resource') {
          blueprintName = 'model';
        }
        return inflection.pluralize(blueprintName);
      }
    };
  }
};

function resourceAttr(name, type) {
  switch (type) {
  case 'has-one':
    return 'hasOne(\'' + name + '\')';
  case 'has-many':
    return 'hasMany(\'' + name + '\')';
  case '':
    return 'attr()';
  default:
    return 'attr(\'' + type + '\')';
  }
}
