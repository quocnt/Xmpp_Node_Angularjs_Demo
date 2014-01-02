
/**
 * Module dependencies.
 */
var express = require('express')
  , http = require('http')
  , crypto = require('crypto')
  , fs = require('fs')
  , path = require('path')
  , routes = require('./routes');

var app = express();

// all environments
app.set('port', process.env.PORT || 8000);
app.set('views', __dirname + '/app');
app.engine('html', require('ejs').renderFile);
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(express.cookieParser());
app.use(express.cookieSession({secret: 'This is my secret'}));
app.use(app.router);
app.use(require('stylus').middleware(__dirname + '/app'));
app.use(express.static(path.join(__dirname, 'app')));

// development only
if ('development' == app.get('env')) {
	app.use(express.errorHandler());
}

app.get('/', routes.index);

app.post('/upload', function(req, res) {
  var image =  req.files.image;
  var newImageLocation = path.join(__dirname, 'app/upload', image.name);
  var fullURL = req.protocol + "://" + req.get('host') + req.url;
  console.log('day la full url: ' + fullURL);
  fs.readFile(image.path, function(err, data) {
      fs.writeFile(newImageLocation, data, function(err) {
          res.json(200, { 
              status: 200,
              src: fullURL + '/' + image.name,
              size: image.size
          });
      });
  });
});



http.createServer(app).listen(8000);
console.log("8000 is started");