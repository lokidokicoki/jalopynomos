module.exports = function(app, api) {
    app.post('/postTest', function(req, res) {
        console.log('req postTest:', req.body.name);

        res.send(req.body.name);
    });

    app.post('/ajaxTest', function(req, res) {
        console.log('req ajaxTest:', req.body.name);
        res.send({
            data: req.body.name
        });
    });

	app.get('/', function (req, res){
		res.render('index', {vehicles:api.getVehicleArray()});
	});

    app.get('/vehicle/:id', function(req, res) {
        var vehicle = api.getVehicle(req.params.id);
        res.render('vehicle', {
            title: vehicle.toString(),
            vehicle: vehicle
        });
    });
    app.get('/fuel/:id', function(req, res) {
        var fuel = api.getFillUp(req.params.id);
        res.render('fuel', {
            fuel: fuel
        });
    });

	app.get('/about', function(req, res) {
		res.render('about');
	});
	app.get('/contact', function(req, res) {
		res.render('contact');
	});
};
