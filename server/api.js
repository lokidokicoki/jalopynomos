/**
 * Main thinky part of app.
 * @author lokidokicoki
 * @module jalopynomos/lib/api
 */

var _ = require('lodash');
var U = require('./utils');
var fs = require('fs-extra');
var path = require('path');

var vehicles = {};
var fillUps = {};
var services = {};
var fuelTypes = {
    'U': 'Unleaded',
    'D': 'Diesel',
    'S': 'Super unleaded'
};
var LITRES_IN_GALLON = 4.54609;
var GALLONS_IN_LITRE = 0.219969;
var dataFile = '';
var _maxVehicleId = 0;
var DAY_IN_MS = 24 * 60 * 60 * 1000;
var YEAR_IN_MS = 356 * DAY_IN_MS;

/**
 * @constructor
 */
function Vehicle(values) {
    'use strict';
    this.id = null;
    this.regNo = '';
    this.make = '';
    this.type = '';
    this.year = 0;
    this.purchase = {
        price: 0,
        date: '',
    };
    this.fuel = {
        capacity: 0,
        type: ''
    };
    this.oil = {
        capacity: 0,
        type: ''
    };
    this.tyres = {
        front: {
            capacity: 0,
            type: ''
        },
        rear: {
            capacity: 0,
            type: ''
        }
    };
    this.notes = '';
    this.fuelIDs = [];
    this.serviceIDs = [];
    this.fuelRecs = [];
    this.serviceRecs = [];
    this.avgRecs = [];
    this.summary = new Summary(this);

    for (var k in values) {
        this[k] = values[k];
    }

    this.toString = function() {
        return this.make + ' ' + this.type + ' ' + this.regNo;
    };

    this.getFuelRecs = function() {
        var i, len;
        this.fuelRecs.length = 0;
        this.avgRecs.length = 0;
        for (i = 0, len = this.fuelIDs.length; i < len; i++) {
            this.fuelRecs.push(getFillUp(this.fuelIDs[i]));
        }

        U.sortRecs(this.fuelRecs, 'date', false);

        var tmpg = 0;
        for (i = 0, len = this.fuelRecs.length; i < len; i++) {
            tmpg += this.fuelRecs[i].mpg;
            this.avgRecs.push(parseFloat((tmpg / (i + 1)).toFixed(2)));
        }
        return this.fuelRecs;

    };

    this.getServiceRecs = function() {
        this.serviceRecs.length = 0;
        for (var i = 0, len = this.serviceIDs.length; i < len; i++) {
            this.serviceRecs.push(getService(this.serviceIDs[i]));
        }

        U.sortRecs(this.serviceRecs, 'date', false);
    };

    this.getChartData = function(type) {
        var data = [],
            rec;
        for (var i = 0, len = this.fuelRecs.length; i < len; i++) {
            rec = this.fuelRecs[i];
            data.push({
                mpg: rec.mpg,
                date: rec.date
            });
        }

        return data;
    };
}

function Summary(vehicle) {
    this.vehicle = vehicle;

    this.reset = function() {
        this.mpg = {
            min: Number.MAX_VALUE,
            max: 0,
            avg: 0
        };
        this.ppl = {
            min: Number.MAX_VALUE,
            max: 0,
            avg: 0
        };
		this.range = {
			min:0,
			max:0,
			avg:0
		};
		this.costs ={
			fuel:0,
			service:0,
			total:0,
			running:0,
			distance:{
				total:0,
				running:0
			}
		};
		this.distance = {
			total:0,
			daily:0,
			yearly:0,
			predicted:{
				daily:0,
				yearly:0
			}
		};
		this.lastRecordDate = 0;
    };

    this.summarise = function() {
        this.reset();
        this.costs.total = this.vehicle.purchase.price;

        var recs = this.vehicle.fuelRecs,
            len = 0,
            i = 0,
            rec = null;
        if (recs && recs !== undefined) {
            len = recs.length;
            for (; i < len; i++) {
                rec = recs[i];
                this.costs.total += rec.cost;
                this.costs.fuel += rec.cost;
                this.mpg.max = Math.max(this.mpg.max, rec.mpg);
                this.mpg.min = Math.min(this.mpg.min, rec.mpg);
                this.mpg.avg += rec.mpg;
                this.ppl.max = Math.max(this.ppl.max, rec.ppl);
                this.ppl.min = Math.min(this.ppl.min, rec.ppl);
                this.ppl.avg += rec.ppl;
				this.distance.total += rec.trip;
				this.lastRecordDate = Math.max(this.lastRecordDate, rec.date);
            }

            this.mpg.avg /= len;
            this.ppl.avg /= len;
        }

        recs = this.vehicle.serviceRecs;
        if (recs && recs !== undefined) {
            len = recs.length;
            i = 0;
            for (; i < len; i++) {
                rec = recs[i];
                this.costs.total += rec.cost;
                this.costs.service += rec.cost;
            }
        }
		
		this.costs.running = this.costs.service + this.costs.fuel;
		this.costs.distance.running = this.costs.running / this.distance.total;
		this.costs.distance.total = this.costs.total / this.distance.total;
    };

	this.update = function(now){
		var a = (this.distance.total / (this.lastRecordDate - this.vehicle.purchase.date));
		var p = (this.distance.total / (now - this.vehicle.purchase.date));
		this.distance.daily  = a * DAY_IN_MS;
		this.distance.yearly  = a * YEAR_IN_MS;
		this.distance.predicted.daily  = p * DAY_IN_MS;
		this.distance.predicted.yearly  = p * YEAR_IN_MS;
	};
}

/**
 * @constructor
 */
function Fuel(values) {
    'use strict';
    this.id = null;
    this.date = '';
    this.litres = 0;
    this.ppl = 0;
    this.trip = 0;
    this.odo = 0;
    this.cost = 0;
    this.mpg = 0;
    this.notes = '';
    this.type = 'U';

    for (var k in values) {
        this[k] = values[k];
    }

    if (this.id === null || this.id === undefined) {
        this.id = _.size(fillUps) + 1;
    }

    this.toString = function() {
        // date | cost | litres | trip | odo | mpg
        var data = U.formatDate(this.date) + ' | ' +
            U.formatCost(this.cost) + ' | ' +
            this.litres + ' | ' +
            this.trip + ' | ' +
            U.formatMPG(this.mpg);

        return data;
    };

    this.calculateMPG = function() {
        this.mpg = this.trip / (this.litres / LITRES_IN_GALLON);
    };

    this.calculatePPL = function() {
        this.ppl = parseFloat((this.cost / this.litres).toFixed(3));
    };
}

/**
 * @constructor
 */
function Service(values) {
    'use strict';
    this.id = null;
    this.date = '';
    this.cost = 0;
    this.odo = 0;
    this.item = '';
    this.notes = '';

    for (var k in values) {
        this[k] = values[k];
    }

    if (this.id === null || this.id === undefined) {
        this.id = _.size(services) + 1;
    }

    this.toString = function() {
        // date | cost | litres | trip | odo | mpg
        var data = U.formatDate(this.date) + ' | ' +
            U.formatCost(this.cost) + ' | ' +
            this.odo + ' | ' +
            this.item;

        return data;
    };
}

/**
 * Load data from object in collections.
 */
function load(fileName) {
    'use strict';

    var data, k, len, record;
    dataFile = path.join(__dirname + '/../' + fileName);
    console.log(dataFile);
    data = fs.readJSONSync(dataFile);
    for (k in data.fillUps) {
        record = new Fuel(data.fillUps[k]);
        fillUps[record.id] = record;
    }

    for (k in data.services) {
        record = new Service(data.services[k]);
        services[record.id] = record;
    }
    for (k in data.vehicles) {
        record = new Vehicle(data.vehicles[k]);
        record.getFuelRecs();
        record.getServiceRecs();
        record.summary.summarise();
        vehicles[record.id] = record;
        if (record.id > _maxVehicleId) {
            _maxVehicleId = record.id;
        }
    }

}

function save() {
    var data = get();

    fs.writeJSONSync(dataFile, data);
}

/**
 * Massage collections into portable format.
 */
function get() {
    'use strict';

    var v = _.cloneDeep(vehicles);

    // clean out calculated stuff.
    for (var k in v) {
        var obj = v[k];
        delete obj.fuelRecs;
        delete obj.serviceRecs;
        delete obj.avgRecs;
        delete obj.getFuelRecs;
        delete obj.getServiceRecs;
        delete obj.getChartData;
        delete obj.toString;
		delete obj.summary;
    }

    var data = {
        vehicles: v,
        fillUps: fillUps,
        services: services
    };

    return data;
}

function getVehicles() {
    'use strict';
    return vehicles;
}

function getVehicleArray() {
    'use strict';
    var a = [];
    for (var k in vehicles) {
        a.push(vehicles[k]);
    }
    return a;
}

function getVehicle(id) {
    'use strict';
    var v = vehicles[id];
	v.summary.update(Date.now());
	return v;
}

function getFillUp(id) {
    'use strict';


    return fillUps[id];
}

function getService(id) {
    'use strict';
    return services[id];
}

function getFuelType(type) {
    'use strict';
    return fuelTypes[type];
}

function addFillUp(vehicle, data) {
    'use strict';
    var fillUp;

    data.odo = parseInt(data.odo);
    data.litres = parseFloat(data.litres);
    data.trip = parseFloat(data.trip);
    data.ppl = parseFloat(data.ppl);
    data.cost = parseFloat(data.cost);
    data.date = parseInt(data.date);

    //TODO: need some validation!
    fillUp = new Fuel(data);
    fillUp.calculateMPG();
    fillUp.calculatePPL();
    fillUps[fillUp.id] = fillUp;
    vehicle.fuelIDs.push(fillUp.id);
    vehicle.getFuelRecs();
    vehicle.summary.summarise();

    save();
    return fillUp;
}

function addService(vehicle, data) {
    'use strict';
    var service;

    data.odo = parseInt(data.odo);
    data.cost = parseFloat(data.cost);
    data.date = parseInt(data.date);

    //TODO: need some validation!
    service = new Service(data);
    services[service.id] = service;
    vehicle.serviceIDs.push(service.id);
    vehicle.getServiceRecs();
    vehicle.summary.summarise();

    save();
    return service;
}

/**
 * Add new vehicle to collection.
 *
 * Saves to data store.
 * @param {object} data form data for new vehicle
 * @return {Vehicle} new vehicle record
 */
function addVehicle(data) {
    'use strict';
    var vehicle = {};

    //console.log(data);

    // massage incoming data to match expected, then create 'new' Vehicle.
    data.purchase = {
        price: parseFloat(data.purchasePrice),
        date: U.parseDate(data.purchaseDate)
    };
    delete data.purchasePrice;
    delete data.purchaseDate;

    data.fuel = {
        capacity: U.ensureNumber(data.fuelCapacity, 0),
        type: data.fuelType
    };
    delete data.fuelCapacity;
    delete data.fuelType;

    data.oil = {
        capacity: U.ensureNumber(data.oilCapacity, 0),
        type: data.oilType
    };
    delete data.oilCapacity;
    delete data.oilType;

    data.tyres = {
        front: {
            capacity: U.ensureNumber(data.tyreFrontCapacity, 0),
            type: data.tyreFrontType.toUpperCase()
        },
        rear: {
            capacity: U.ensureNumber(data.tyreRearCapacity, 0),
            type: data.tyreRearType.toUpperCase()
        }
    };
    delete data.tyreFrontType;
    delete data.tyreFrontCapacity;
    delete data.tyreRearType;
    delete data.tyreRearCapacity;

    data.regNo = data.regNo.toUpperCase();
    data.year = U.ensureNumber(data.year, 0);
    data.odo = U.ensureNumber(data.odo, 0);

    data.id = ++_maxVehicleId;

    vehicle = new Vehicle(data);

    vehicles[vehicle.id] = vehicle;

    save();
    return vehicle;
}

function updateVehicle(data) {
    'use strict';
    var vehicle = vehicles[data.id];

    // massage incoming data to match expected, then create 'new' Vehicle.
    vehicle.purchase = {
        price: parseFloat(data.purchasePrice),
        date: U.parseDate(data.purchaseDate)
    };
    vehicle.fuel = {
        capacity: U.ensureNumber(data.fuelCapacity, 0),
        type: data.fuelType
    };
    vehicle.oil = {
        capacity: U.ensureNumber(data.oilCapacity, 0),
        type: data.oilType
    };

    vehicle.tyres = {
        front: {
            capacity: U.ensureNumber(data.tyreFrontCapacity, 0),
            type: data.tyreFrontType.toUpperCase()
        },
        rear: {
            capacity: U.ensureNumber(data.tyreRearCapacity, 0),
            type: data.tyreRearType.toUpperCase()
        }
    };

    vehicle.regNo = data.regNo.toUpperCase();
    vehicle.year = U.ensureNumber(data.year, 0);
    vehicle.odo = U.ensureNumber(data.odo, 0);

    save();
    return vehicle;
}

function removeVehicle(id) {
    'use strict';

    var vehicle = vehicles[id],
        i = 0,
        len = 0;

    // remove fuel recs for this vehicle
    for (i = 0, len = vehicle.fuelIDs.length; i < len; i++) {
        delete fillUps['' + vehicle.fuelIDs[i]];
    }
    for (i = 0, len = vehicle.serviceIDs.length; i < len; i++) {
        delete services['' + vehicle.serviceIDs[i]];
    }

    vehicle = null;
    delete vehicles[id];
    save();
}

function removeFillUp(vehicle, id) {
    'use strict';

    var idx = vehicle.fuelIDs.indexOf(parseInt(id));
    vehicle.fuelIDs.splice(idx, 1);
    delete fillUps['' + id];
    vehicle.getFuelRecs();
    vehicle.summary.summarise();

    save();
}

function removeService(vehicle, id) {
    'use strict';

    var idx = vehicle.serviceIDs.indexOf(parseInt(id));
    vehicle.serviceIDs.splice(idx, 1);
    delete services['' + id];
    vehicle.getServiceRecs();
    vehicle.summary.summarise();

    save();
}

function updateFillUp(vehicle, data) {
    'use strict';
    var fillUp = fillUps[data.id];

    fillUp.odo = parseInt(data.odo);
    fillUp.litres = parseFloat(data.litres);
    fillUp.trip = parseFloat(data.trip);
    fillUp.ppl = parseFloat(data.ppl);
    fillUp.cost = parseFloat(data.cost);
    fillUp.date = parseInt(data.date);
    fillUp.notes = data.notes;

    //TODO: need some validation!
    fillUp.calculateMPG();
    fillUp.calculatePPL();
    vehicle.getFuelRecs();
    vehicle.summary.summarise();

    save();
    return fillUp;
}

function updateService(vehicle, data) {
    'use strict';
    var service = services[data.id];

    service.odo = parseInt(data.odo);
    service.cost = parseFloat(data.cost);
    service.date = parseInt(data.date);
    service.item = data.item;
    service.notes = data.notes;

    //TODO: need some validation!
    vehicle.getServiceRecs();
    vehicle.summary.summarise();

    save();
    return service;
}

function getFuelTypes() {
    var fts = [];
    for (var k in fuelTypes) {
        fts.push([k, fuelTypes[k]]);
    }
    return fts;
}

function getHistoricFuelPrices() {
    'use strict';
    var data = {},
        i = 0,
        len = 0,
        rec, min = 9007199254740992,
        max = 0,
        dates = [];

    for (i in fillUps) {
        rec = fillUps[i];
        if (data[fuelTypes[rec.type]] === undefined) {
            data[fuelTypes[rec.type]] = [];
        }

        data[fuelTypes[rec.type]].push({
            date: rec.date,
            ppl: rec.ppl
        });
        dates.push(rec.date);
        if (min > rec.date) {
            min = rec.date;
        }
        if (max < rec.date) {
            max = rec.date;
        }
    }

    for (i in data) {
        data[i] = U.sortRecs(data[i], 'date');
    }

    dates = _.uniq(dates).sort();
    return {
        data: data,
        min: min,
        max: max,
        dates: dates
    };
}

module.exports = {
    Vehicle: Vehicle,
    Fuel: Fuel,
    Service: Service,
    load: load,
    save: save,
    get: get,
    getVehicles: getVehicles,
    getVehicleArray: getVehicleArray,
    getVehicle: getVehicle,
    getFillUp: getFillUp,
    getService: getService,
    getFuelType: getFuelType,
    getFuelTypes: getFuelTypes,
    getHistoricFuelPrices: getHistoricFuelPrices,
    addFillUp: addFillUp,
    updateFillUp: updateFillUp,
    updateService: updateService,
    addVehicle: addVehicle,
    updateVehicle: updateVehicle,
    removeVehicle: removeVehicle,
    removeFillUp: removeFillUp,
    addService: addService,
    removeService: removeService
};
