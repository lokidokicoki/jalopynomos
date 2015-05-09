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

	app.get('/vehicle/add', function(req, res){
		res.render('vehicle/add', {
			fuelTypes:api.getFuelTypes(),
			title:'Add Vehicle'
		});
	});

	app.post('/vehicle/save', function(req, res){
		var vehicle = api.addVehicle(req.body);
		res.render('index', {
			vehicles:api.getVehicleArray(),
			title:'Save Vehicle'
		});
	});


	// top level vehicle route
    app.get('/vehicle/:id', function(req, res) {
        var vehicle = api.getVehicle(req.params.id);
        res.render('vehicle/details', {
            title: vehicle.toString(),
            vehicle: vehicle
        });
    });

    app.get('/vehicle/:id/edit', function(req, res) {
        var vehicle = api.getVehicle(req.params.id);
        res.render('vehicle/edit', {
            title: vehicle.toString(),
            vehicle: vehicle,
			fuelTypes:api.getFuelTypes()
        });
    });

    app.get('/vehicle/:id/remove', function(req, res) {
       	api.removeVehicle(req.params.id);
		res.render('index', {
			vehicles:api.getVehicleArray(),
			title:'Remove Vehicle'
		});
    });

	app.post('/vehicle/:id/update', function(req, res){
		var vehicle = api.updateVehicle(req.body);
        res.render('vehicle/details', {
            title: 'Update '+vehicle.toString(),
            vehicle: vehicle
        });
	});

	// fillup routes - add/save/details/remove/edit/update
    app.get('/vehicle/:vid/fuel/add', function(req, res) {
        var vehicle = api.getVehicle(req.params.vid);
		var fillUp = vehicle.fuelRecs[0];
        res.render('fuel/add', {
            vehicle: {title:vehicle.toString(), id:vehicle.id, fuelType:vehicle.fuel.type},
			fuelTypes:api.getFuelTypes(),
			fillUp:fillUp,
			title:'Add Fuel'
        });
    });

	app.post('/vehicle/:vid/fuel/save', function(req, res){
        var vehicle = api.getVehicle(req.params.vid);
		req.body.date = utils.parseDate(req.body.date);
		var fuel = api.addFillUp(vehicle, req.body);
		res.render('fuel/details', {
            vehicle: {title:vehicle.toString(), id:vehicle.id},
            fuel: fuel,
			canAdd:true,
			title:'Save Fuel'
		});
	});

    app.get('/vehicle/:vid/fuel/:id', function(req, res) {
        var vehicle = api.getVehicle(req.params.vid);
        var fuel = api.getFillUp(req.params.id);
        res.render('fuel/details', {
            vehicle: {title:vehicle.toString(), id:vehicle.id},
            fuel: fuel,
			title:'Fuel Details'
        });
    });

    app.get('/vehicle/:vid/fuel/:id/remove', function(req, res) {
        var vehicle = api.getVehicle(req.params.vid);
       	api.removeFillUp(vehicle, req.params.id);
        res.render('vehicle/details', {
            title:vehicle.toString(),
            vehicle: vehicle
        });
    });

    app.get('/vehicle/:vid/fuel/:id/edit', function(req, res) {
        var vehicle = api.getVehicle(req.params.vid);
        var fuel = api.getFillUp(req.params.id);
        res.render('fuel/edit', {
            title: 'Edit Fuel',
            vehicle: {title:vehicle.toString(), id:vehicle.id},
            fuel: fuel,
			fuelTypes:api.getFuelTypes()
        });
    });

    app.post('/vehicle/:vid/fuel/:id/update', function(req, res) {
        var vehicle = api.getVehicle(req.params.vid);
		req.body.date = utils.parseDate(req.body.date);
		var fillUp = api.updateFillUp(vehicle, req.body);
        res.render('vehicle/details', {
            title:vehicle.toString(),
            vehicle: vehicle
        });
    });

	// service routes add/save/remove/edit/update/details
    app.get('/vehicle/:vid/service/add', function(req, res) {
        var vehicle = api.getVehicle(req.params.vid);
        res.render('service/add', {
			title:'Add Service',
            vehicle: { title:vehicle.toString(), id:vehicle.id }
        });
    });

	app.post('/vehicle/:vid/service/save', function(req, res){
        var vehicle = api.getVehicle(req.params.vid);
		req.body.date = utils.parseDate(req.body.date);
		var service = api.addService(vehicle, req.body);
		res.render('service/details', {
			title:'Save Service',
            vehicle: {title:vehicle.toString(), id:vehicle.id},
            service: service,
			canAdd:true
		});
	});

    app.get('/vehicle/:vid/service/:id/remove', function(req, res) {
        var vehicle = api.getVehicle(req.params.vid);
       	api.removeService(vehicle, req.params.id);
        res.render('vehicle/details', {
            title: vehicle.toString(),
            vehicle: vehicle
        });
    });

    app.get('/vehicle/:vid/service/:id/edit', function(req, res) {
        var vehicle = api.getVehicle(req.params.vid);
        var service = api.getService(req.params.id);
        res.render('service/edit', {
			title:'Edit Service',
            vehicle: {title:vehicle.toString(), id:vehicle.id},
            service: service
        });
    });

    app.post('/vehicle/:vid/service/:id/update', function(req, res) {
        var vehicle = api.getVehicle(req.params.vid);
		req.body.date = utils.parseDate(req.body.date);
		var service = api.updateService(vehicle, req.body);
        res.render('vehicle/details', {
            title: vehicle.toString(),
            vehicle: vehicle
        });
    });


    app.get('/vehicle/:vid/service/:id', function(req, res) {
        var vehicle = api.getVehicle(req.params.vid);
        var service = api.getService(req.params.id);
        res.render('service/details', {
			title:'Service Details',
            vehicle: {title:vehicle.toString(), id:vehicle.id},
            service: service
        });
    });

	// mpg route
    app.get('/vehicle/:vid/mpg', function(req, res) {
        var vehicle = api.getVehicle(req.params.vid);
		
        res.render('vehicle/mpg', {
			title:vehicle.toString() + ' MPG' ,
            vehicle: {title:vehicle.toString(), id:vehicle.id}
        });
    });

	app.post('/mpg', function(req, res){
        var vehicle = api.getVehicle(req.body.vid);
		var data  = vehicle.getChartData().reverse();
		for(var i = 0, len = data.length; i< len; i++){
			data[i].date = utils.formatDate(data[i].date);
			data[i].mpg = parseFloat(data[i].mpg.toFixed(2));
		}

		res.send({vehicle:{title:vehicle.toString()}, data:{mpg:data, avg:vehicle.avgRecs}});
	});

	app.post('/ppl', function(req, res){
		var data  = api.getHistoricFuelPrices();
		res.send({data:data});
	});
};
