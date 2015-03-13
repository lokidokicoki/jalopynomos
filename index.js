var express = require('express');
var partials = require('express-partials');
var bodyParser = require('body-parser');
var fs = require('fs');
var path = require('path');
var api = require('./server/api');
var data = require('./data/records.json');
var app = express();
var hbs = require('hbs');
var moment = require('moment');
var oneDay = 86400000;

api.load(data);

hbs.registerHelper('getFuelType', function(type){
	return api.getFuelType(type);
});
hbs.registerHelper('parseDate', function(dateString) {
	return moment(dateString).format('YYYY/MM/DD');
});

hbs.registerHelper('formatCost', function(cost, options) {
	options = (options === undefined) ? {dp:2} : options.hash;
	options.dp = (options.dp === undefined) ? 2 : options.dp;
	
	return '£'+cost.toFixed(options.dp);
});

hbs.registerHelper('formatMPG', function(mpg) {
	return mpg.toFixed(2);
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

