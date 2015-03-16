/**
 * Main thinky part of app.
 * @author lokidokicoki
 * @module jalopynomos/lib/api
 */

var _ = require('lodash');
var utils = require('./utils');

var vehicles = {};
var fillUps = {};
var services = {};
var fuelTypes = {
	'U':'Unleaded',
	'D':'Diesel',
	'S':'Super unleaded'
};
var LITRES_IN_GALLON = 4.54609;
var GALLONS_IN_LITRE = 0.219969;

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
    this.purchase={
		price : 0,
    	date : '',
	};
    this.fuel= {
		capacity : 0,
    	type : ''
	};
    this.oil= {
		capacity : 0,
    	type : ''
	};
    this.tyres = {
		front : {
			capacity : 0,
			type : ''
		},
		rear : {
			capacity : 0,
			type : ''
		}
	};
    this.notes = '';
	this.fuelIDs=[];
	this.serviceIDs=[];

	for (var k in values){
		this[k] = values[k];
	}

	this.toString = function (){
		return this.make + ' ' +this.type +' '+this.regNo;
	};
}

function Summary(){
	this.mpg={min:0,max:0,avg:0};

	this.summarise = function () {
		
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

	for (var k in values){
		this[k] = values[k];
	}

	if (this.id === null || this.id === undefined){
		this.id = _.size(fillUps);
	}

	this.toString = function(){
		// date | cost | litres | trip | odo | mpg
		var data = utils.formatDate(this.date) + ' | ' + 
			utils.formatCost(this.cost) + ' | ' + 
			this.litres + ' | ' + 
			this.trip + ' | ' + 
			utils.formatMPG(this.mpg);
		
		return data;
	};

	this.calculateMPG = function(){
		this.mpg = this.trip / (this.litres / LITRES_IN_GALLON);
	};

	this.calculatePPL = function(){
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

	for (var k in values){
		this[k] = values[k];
	}
	if (this.id === null || this.id === undefined){
		this.id = _.size(services);
	}


	this.toString = function(){
		// date | cost | litres | trip | odo | mpg
		var data = utils.formatDate(this.date) + ' | ' + 
			utils.formatCost(this.cost) + ' | ' + 
			this.odo + ' | ' + 
			this.item;
		
		return data;
	};

}

/**
 * Load data from object in collections.
 */
function load(data){
	'use strict';
	var k,len, record;	
	for(k in data.vehicles){
		record = new Vehicle(data.vehicles[k]);
		vehicles[record.id] = record;
	}

	for(k in data.fillUps){
		record = new Fuel(data.fillUps[k]);
		fillUps[record.id] = record;
	}

	for(k in data.services){
		record = new Service(data.services[k]);
		services[record.id] = record;
	}
}

/**
 * Massage collections into portable format.
 */
function get(){
	'use strict';
	var data = {
		vehicles:vehicles,
		fillUps:fillUps,
		services:services
	};

	return data;
}

function getVehicles(){
	'use strict';
	return vehicles;
}
function getVehicleArray(){
	'use strict';
	var a = [];
	for (var k in vehicles){
		a.push(vehicles[k]);
	}
	return a;
}
function getVehicle(id){
	'use strict';
	return vehicles[id];
}
function getFillUp(id){
	'use strict';
	return fillUps[id];
}
function getService(id){
	'use strict';
	return services[id];
}

function getFuelType(type){
	'use strict';
	return fuelTypes[type];
}

function addFillUp(vehicle, data){
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

	return fillUp;
}

function getFuelTypes(){
	var fts = [];
	for (var k in fuelTypes){
		fts.push([k, fuelTypes[k]]);
	}
	return fts;
}

module.exports = {
	Vehicle:Vehicle,
	Fuel:Fuel,
	Service:Service,
	load:load,
	get:get,
	getVehicles:getVehicles,
	getVehicleArray:getVehicleArray,
	getVehicle:getVehicle,
	getFillUp:getFillUp,
	getService:getService,
	getFuelType:getFuelType,
	getFuelTypes:getFuelTypes,
	addFillUp:addFillUp
};
