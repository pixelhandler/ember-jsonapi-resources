/*jshint node:true*/
module.exports = {
  description: 'jsonapi-blueprint, generates addon blueprint (use addon name)',

  anonymousOptions: ['name'],

  locals: function(options) {
    return { name: options.args[1] };
  }
};
