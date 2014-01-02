
/**
 * Module dependencies.
 */
var express = require('express')
  , http = require('http')
  , path = require('path');

var app = express();

// all environments
app.set('port', process.env.PORT || 8000);
app.set('views', __dirname + './app');
app.use(app.router);
// app.use(require('stylus').middleware(__dirname + '/app'));
app.use(express.static(path.join(__dirname, './app')));

app.get('/', function(req,res){
	res.render(__dirname + './app/index.html', {});
});


http.createServer(app).listen(8000);
console.log("6789 is started");