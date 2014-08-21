var express = require('express'),
  app = express(),
  bodyParser = require('body-parser'),
  errorHandler = require('errorhandler'),
  methodOverride = require('method-override'),
  compress = require('compression'),
  morgan = require('morgan'),
  favicon = require('serve-favicon'),
  port = parseInt(process.env.PORT, 10) || 8080,
  env = process.env.NODE_ENV || 'dev',
  cacheControl = {};

app.get('/', function (req, res) {
  res.sendFile(__dirname + '/public/index.html');
});

if(env === 'production'){
  cacheControl = {maxAge: 86400000};
}

app.use(favicon(__dirname + '/public/assets/images/favicon.ico'));
app.use(methodOverride());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(compress());
app.use(express.static(__dirname + '/public', cacheControl));
app.use(morgan());
app.use(errorHandler({
  dumpExceptions: true,
  showStack: true
}));

app.listen(port);
