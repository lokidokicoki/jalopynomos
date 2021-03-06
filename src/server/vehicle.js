'use strict';
/* @flow */
import * as api from './api';
import * as utils from './utils';
import {Fuel} from './fuel';
import {Service} from './service';
import {Summary} from './summary';

/**
 * Vehicle record holder
 */
export class Vehicle {
  id: number;
  regNo: string;
  make: string;
  type: string;
  year: number;
  active: boolean;
  purchase: Object;
  fuel: Object;
  oil: Object;
  tyres: Object;
  notes: string;
  fuelIDs: number[];
  serviceIDs: number[];
  fuelRecs: Fuel[];
  serviceRecs: Service[];
  avgRecs: number[];
  summary: Summary;

  /**
   * @param {object} values new vehicle values
   * @constructor
   */
  constructor(values: Object) {
    this.id       = -1;
    this.regNo    = ``;
    this.make     = ``;
    this.type     = ``;
    this.year     = 0;
    this.active   = true;
    this.purchase = {
      price: 0,
      date: ``
    };
    this.fuel = {
      capacity: 0,
      type: ``
    };
    this.oil = {
      capacity: 0,
      type: ``
    };
    this.tyres = {
      front: {
        capacity: 0,
        type: ``
      },
      rear: {
        capacity: 0,
        type: ``
      }
    };
    this.notes       = ``;
    this.fuelIDs     = [];
    this.serviceIDs  = [];
    this.fuelRecs    = [];
    this.serviceRecs = [];
    this.avgRecs     = [];
    this.summary     = new Summary(this);

    console.log(`ctor`, values);

    // copy constructor
    for (let key in values) {
      if (values.hasOwnProperty(key)) {
        this[key] = values[key];
      }
    }
  }

  /**
   * Get stringified record
   * @return {string}
   */
  toString(): string {
    return this.make + ` ` + this.type + ` ` + this.regNo;
  }

  /**
   * Populate fuel and avg mpg record containers
   * @return {Array.<Fuel>}
   */
  fuelRecords(): Fuel[] {
    let i = 0;
    let len;
    let tmpg = 0;

    this.fuelRecs.length = 0;
    this.avgRecs.length  = 0;
    for (i = 0, len = this.fuelIDs.length; i < len; i++) {
      this.fuelRecs.push(api.getFillUp(this.fuelIDs[i]));
    }

    utils.sortRecs(this.fuelRecs, `date`, false);

    for (i = 0, len = this.fuelRecs.length; i < len; i++) {
      tmpg += this.fuelRecs[i].mpg;
      this.avgRecs.push(parseFloat((tmpg / (i + 1)).toFixed(2)));
    }
    return this.fuelRecs;
  }

  /**
   * Popukate service record container
   */
  serviceRecords() {
    let i   = 0;
    let len = 0;
    this.serviceRecs.length = 0;
    for (len = this.serviceIDs.length; i < len; i++) {
      this.serviceRecs.push(api.getService(this.serviceIDs[i]));
    }

    utils.sortRecs(this.serviceRecs, `date`, false);
  }

  /**
   * Create fuel chart data.
   * @return {Array.<{mpg:number, date:number}>}
   */
  chartData() {
    let data = [];
    let rec;
    let i   = 0;
    let len = 0;
    for (len = this.fuelRecs.length; i < len; i++) {
      rec = this.fuelRecs[i];
      data.push({
        mpg: rec.mpg,
        date: rec.date
      });
    }

    return data;
  }
}
