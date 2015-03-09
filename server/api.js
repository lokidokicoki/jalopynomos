/**
 * Main thinky part of app.
 * @author lokidokicoki
 * @module jalopynomos/lib/api
 */

var vehicles = {};
var fillUps = {};
var services = {};

/**
 * @constructor
 */
function Vehicle(values) {
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

/**
 * @constructor
 */
function Fuel(values) {
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
}

/**
 * @constructor
 */
function Service(values) {
    this.id = null;
    this.date = '';
    this.cost = 0;
    this.odo = 0;
    this.item = '';
    this.notes = '';

	for (var k in values){
		this[k] = values[k];
	}
}

/**
 * Load data from object in collections.
 */
function load(data){
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
	var data = {
		vehicles:vehicles,
		fillUps:fillUps,
		services:services
	};

	return data;
}

function getVehicles(){
	return vehicles;
}
function getVehicleArray(){
	var a = [];
	for (var k in vehicles){
		a.push(vehicles[k]);
	}
	return a;
}
function getVehicle(id){
	return vehicles[id];
}
function getFillUp(id){
	return fillUps[id];
}
function getService(id){
	return services[id];
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
	getService:getService
};
