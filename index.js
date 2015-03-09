var express = require('express');
var partials = require('express-partials');
var bodyParser = require('body-parser');
var fs = require('fs');
var path = require('path');
var api = require('./server/api');
var data = require('./data/records.json');
var app = express();
var hbs = require('hbs');
var oneDay = 86400000;

api.load(data);

hbs.registerHelper('parseDate', function(dateString) {
	return new Date(parseInt(dateString)).toString();
});

app.set( 'views', path.join( __dirname, 'views' ));
app.set('view engine', 'html');
app.engine('html', hbs.__express);
app.use(partials()); // use partials for layout.html
// use bodyParser
app.use(bodyParser.urlencoded({
	extended:false
}));

// parse application/json
app.use(bodyParser.json());

app.use(express.static('public', { maxAge:oneDay }));


var server = app.listen('51000', function (){
	var port = server.address().port;
	console.log('express @ %s', port);
});
require('./routes')(app, api);

