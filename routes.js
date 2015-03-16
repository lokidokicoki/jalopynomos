module.exports = function(app, api) {
	// menu bar routes
	app.get('/', function (req, res){
		res.render('index', {vehicles:api.getVehicleArray()});
	});
	app.get('/about', function(req, res) {
		res.render('about');
	});
	app.get('/contact', function(req, res) {
		res.render('contact');
	});
	app.get('/history', function(req, res) {
		res.render('history');
	});

	// top level vehicle route
    app.get('/vehicle/:id', function(req, res) {
        var vehicle = api.getVehicle(req.params.id);
        res.render('vehicle', {
            title: vehicle.toString(),
            vehicle: vehicle
        });
    });

	// fillup routes - view/add/save
    app.get('/vehicle/:vid/fuel/:id', function(req, res) {
        var vehicle = api.getVehicle(req.params.vid);
        var fuel = api.getFillUp(req.params.id);
        res.render('fuel', {
            vehicle: {title:vehicle.toString(), id:vehicle.id},
            fuel: fuel
        });
    });

    app.get('/vehicle/:vid/addFillup', function(req, res) {
        var vehicle = api.getVehicle(req.params.vid);
        res.render('addFillup', {
            vehicle: {title:vehicle.toString(), id:vehicle.id, fuelType:vehicle.fuel.type},
			fuelTypes:api.getFuelTypes()
        });
    });

	app.post('/vehicle/:vid/saveFillup', function(req, res){
		console.log('routes.saveFillup: ',req.params.vid, req.body);	
        var vehicle = api.getVehicle(req.params.vid);
		req.body.date = utils.parseDate(req.body.date);
		var fuel = api.addFillup(req.params.vid, req.body);
		res.render('fuel', {
            vehicle: {title:vehicle.toString(), id:vehicle.id},
            fuel: fuel
		});
	});

	// service routes
    app.get('/vehicle/:vid/service/:id', function(req, res) {
        var vehicle = api.getVehicle(req.params.vid);
        var service = api.getService(req.params.id);
        res.render('service', {
            vehicle: {title:vehicle.toString(), id:vehicle.id},
            service: service
        });
    });

};
