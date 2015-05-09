var utils = require('./server/utils');
var pkg = require('./package.json');
module.exports = function(app, api) {
	// menu bar routes
	app.get('/', function (req, res){
		res.render('index', {vehicles:api.getVehicleArray(), title:'Jalopynomos'});
	});
	app.get('/about', function(req, res) {
		res.render('misc/about', {
			title:'About',
			version:pkg.version
		});
	});
	app.get('/history', function(req, res) {
		res.render('misc/history', {title:'Historic Fuel Prices'});
	});
};

