/*jshint node:true*/
var proxyPath = '/api';

module.exports = function(app) {
  // For options, see:
  // https://github.com/nodejitsu/node-http-proxy
  var proxy = require('http-proxy').createProxyServer({});

  proxy.on('error', function(err, req) {
    console.error(err, req.url);
  });

  app.use(proxyPath, function(req, res, next){
    // include root path in proxied request
    req.url = proxyPath + '/' + req.url;
    if (process.env.EMBER_ENV == 'development') {
      proxy.web(req, res, { target: 'http://localhost:3000' });
    } else if (process.env.EMBER_ENV == 'production') {
      proxy.web(req, res, { target: 'http://api.pixelhandler.com' });
    }
  });
};
