'use strict';

/**
 * Main thinky part of app.
 * @author lokidokicoki
 * @module jalopynomos/lib/api
 * @flow
 */

import _ from 'lodash';
import * as U from './utils';
import fs from 'fs-extra';
import path from 'path';

import Vehicle from './vehicle';
import Fuel from './fuel';
import Service from './service';

let vehicles  = {};
let fillUps   = {};
let services  = {};
let fuelTypes = {
  U: `Unleaded`,
  D: `Diesel`,
  S: `Super unleaded`
};
//let GALLONS_IN_LITRE = 0.219969;
let dataFile      = ``;
let _maxVehicleId = 0;

/**
 * Load data from object in collections.
 * @param {string} fileName name of file to load
 */
function load(fileName: string) {
  let data;
  let record;
  dataFile = path.join(__dirname, `/../`, fileName);
  console.log(`Load this file:`, dataFile);
  data = fs.readJSONSync(dataFile);

  for (let k in data.fillUps) {
    if (data.fillUps.hasOwnProperty(k)) {
      record             = new Fuel(data.fillUps[k]);
      fillUps[record.id] = record;
    }
  }

  for (let k in data.services) {
    if (data.services.hasOwnProperty(k)) {
      record              = new Service(data.services[k]);
      services[record.id] = record;
    }
  }

  for (let k in data.vehicles) {
    if (data.vehicles.hasOwnProperty(k)) {
      record = new Vehicle(data.vehicles[k]);
      record.fuelRecords();
      record.serviceRecords();
      record.summary.summarise();
      vehicles[record.id] = record;
      if (record.id > _maxVehicleId) {
        _maxVehicleId = record.id;
      }
    }
  }
}

/**
 * Massage collections into portable format.
 * @returns {{}} data collection
 */
function get(): Object {
  let v = _.cloneDeep(vehicles);
  let obj;
  let data = {
    vehicles: {},
    fillUps: fillUps,
    services: services
  };

  // clean out calculated stuff.
  for (let k in v) {
    if (v.hasOwnProperty(k)) {
      obj = v[k];
      delete obj.fuelRecs;
      delete obj.serviceRecs;
      delete obj.avgRecs;
      delete obj.fuelRecords;
      delete obj.serviceRecords;
      delete obj.chartData;
      delete obj.toString;
      delete obj.summary;
    }
  }

  data.vehicles = v;

  return data;
}

/**
 * Write data to file
 */
function save() {
  let data = get();

  fs.writeJSONSync(dataFile, data);
}

/**
 * Get vehicle collection
 * @return {object} vehicles
 */
function getVehicles() {
  return vehicles;
}

/**
 * Get service collection
 * @return {object} services
 */
function getServices() {
  return services;
}

/**
 * Get fillups collection
 * @return {object} fillups
 */
function getFillUps() {
  return fillUps;
}

/**
 * Get vehicle collection as an arracy
 * @return {array.<Vehicle>} array of vehicle records
 */
function getVehicleArray() {
  let a = [];
  let k;
  for (k in vehicles) {
    a.push(vehicles[k]);
  }
  return a;
}

/**
 * Get vehicle by id
 * @param  {integer} id unique id of record
 * @return {object}    vehicle
 */
function getVehicle(id: number) {
  let v = vehicles[id];
  v.summary.update(Date.now());
  return v;
}

/**
 * Get fuel record by id
 * @param  {integer} id of record
 * @return {object}    fuel record
 */
function getFillUp(id: number) {
  return fillUps[id];
}

/**
 * Get service by id
 * @param  {integer} id of record
 * @return {object}    service record
 */
function getService(id: number) {
  return services[id];
}

/**
 * Get fuel by type
 * @param  {string} type fuel type code, i.e. `U`
 * @return {string} long fuel name
 */
function getFuelType(type: string) {
  return fuelTypes[type];
}

/**
 * Add fuel record for vehicle
 * @param {object} vehicle target to add record to
 * @param {object} data    fuel record
 * @return {object} new fuel record
 */
function addFillUp(vehicle: Vehicle, data: Fuel) {
  let fillUp;

  data.odo    = parseInt(data.odo);
  data.litres = parseFloat(data.litres);
  data.trip   = parseFloat(data.trip);
  data.ppl    = parseFloat(data.ppl);
  data.cost   = parseFloat(data.cost);
  data.date   = parseInt(data.date);

  //TODO: need some validation!
  fillUp = new Fuel(data);
  fillUp.calculateMPG();
  fillUp.calculatePPL();
  fillUps[fillUp.id] = fillUp;
  vehicle.fuelIDs.push(fillUp.id);
  vehicle.fuelRecords();
  vehicle.summary.summarise();

  save();
  return fillUp;
}

/**
 * Add service record for vehicle
 * @param {object} vehicle target to add record to
 * @param {object} data    service record
 * @return {object} new service record
 */
function addService(vehicle: Vehicle, data: Service) {
  let service;

  data.odo  = parseInt(data.odo);
  data.cost = parseFloat(data.cost);
  data.date = parseInt(data.date);

  //TODO: need some validation!
  service              = new Service(data);
  services[service.id] = service;
  vehicle.serviceIDs.push(service.id);
  vehicle.fuelRecords();
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
function addVehicle(data: Object) {
  let vehicle = {};

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
  data.year  = U.ensureNumber(data.year, 0);
  data.odo   = U.ensureNumber(data.odo, 0);

  data.id = ++_maxVehicleId;

  vehicle = new Vehicle(data);

  vehicles[vehicle.id] = vehicle;

  save();
  return vehicle;
}

/**
 * Update vehicle record with new data
 * @param  {object} data new info
 * @return {object}      modified vehicle
 */
function updateVehicle(data: Vehicle) {
  let vehicle = vehicles[data.id];

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

  vehicle.regNo  = data.regNo.toUpperCase();
  vehicle.year   = U.ensureNumber(data.year, 0);
  vehicle.odo    = U.ensureNumber(data.odo, 0);
  vehicle.active = data.active ? true : false;

  vehicle.summary.summarise();
  save();
  return vehicle;
}

/**
 * Remove vehicle from collection.
 *
 * Calls `save`, so this is permenant.
 * @param  {integer} id of vehicle
 */
function removeVehicle(id: number) {
  let vehicle = vehicles[id];
  let i       = 0;
  let len     = 0;

  // remove fuel recs for this vehicle
  for (i = 0, len = vehicle.fuelIDs.length; i < len; i++) {
    delete fillUps[String(vehicle.fuelIDs[i])];
  }
  for (i = 0, len = vehicle.serviceIDs.length; i < len; i++) {
    delete services[String(vehicle.serviceIDs[i])];
  }

  vehicle = null;
  delete vehicles[id];
  save();
}

/**
 * Remove fuel record from vehicle
 * @param  {object} vehicle target
 * @param  {int} id      of fuel record to remove
 */
function removeFillUp(vehicle: Vehicle, id: number) {
  let idx = vehicle.fuelIDs.indexOf(parseInt(id));
  vehicle.fuelIDs.splice(idx, 1);
  delete fillUps[String(id)];
  vehicle.fuelRecords();
  vehicle.summary.summarise();

  save();
}

/**
 * Remove service record form vehicle
 * @param  {object} vehicle target vehicle
 * @param  {int} id      of service record
 */
function removeService(vehicle: Vehicle, id: number) {
  let idx = vehicle.serviceIDs.indexOf(parseInt(id));
  vehicle.serviceIDs.splice(idx, 1);
  delete services[String(id)];
  vehicle.serviceRecords();
  vehicle.summary.summarise();

  save();
}

/**
 * Update fuel record details
 * @param  {object} vehicle target vehicle
 * @param  {object} data    new fuel data
 * @return {object}         modified fuel record
 */
function updateFillUp(vehicle: Vehicle, data: Fuel) {
  let fillUp = fillUps[data.id];

  fillUp.odo    = parseInt(data.odo);
  fillUp.litres = parseFloat(data.litres);
  fillUp.trip   = parseFloat(data.trip);
  fillUp.ppl    = parseFloat(data.ppl);
  fillUp.cost   = parseFloat(data.cost);
  fillUp.date   = parseInt(data.date);
  fillUp.notes  = data.notes;

  //TODO: need some validation!
  fillUp.calculateMPG();
  fillUp.calculatePPL();
  vehicle.fuelRecords();
  vehicle.summary.summarise();

  save();
  return fillUp;
}

/**
 * Update service record details
 * @param  {object} vehicle target vehicle
 * @param  {object} data    new service data
 * @return {object}         modified service record
 */
function updateService(vehicle: Vehicle, data: Service) {
  let service = services[data.id];

  service.odo   = parseInt(data.odo);
  service.cost  = parseFloat(data.cost);
  service.date  = parseInt(data.date);
  service.item  = data.item;
  service.notes = data.notes;

  //TODO: need some validation!
  vehicle.serviceRecords();
  vehicle.summary.summarise();

  save();
  return service;
}

/**
 * Get fuel types from dictionary
 * @return {array}
 */
function getFuelTypes() {
  let fts = [];
  let k;
  for (k in fuelTypes) {
    fts.push([k, fuelTypes[k]]);
  }
  return fts;
}

/**
 * Get historic fuel prices
 * @return {object} use this to build a chart
 */
function getHistoricFuelPrices() {
  let data = {};
  let i    = 0;
  let rec;
  let min   = 9007199254740992;
  let max   = 0;
  let dates = [];

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
    data[i] = U.sortRecs(data[i], `date`);
  }

  dates = _.uniq(dates).sort();
  return {
    data: data,
    min: min,
    max: max,
    dates: dates
  };
}

export {load, save, get, getVehicles, getServices, getVehicleArray, getVehicle, getFillUps, getFillUp, getService, getFuelType, getFuelTypes, getHistoricFuelPrices, addFillUp, updateFillUp, updateService, addVehicle, updateVehicle, removeVehicle, removeFillUp, addService, removeService};
