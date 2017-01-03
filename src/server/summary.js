'use strict';

import * as U from './utils';
import Vehicle from './vehicle';
/**
 * Summary Holder
 * @class
 * @flow
 */
class Summary {
  vehicle: Vehicle;
  mpg: Object;
  ppl: Object;
  range: Object;
  costs: Object;
  distance: Object;
  lastRecordDate: number;

  /**
   * Create new summary record
   * @param {object} vehicle new record details
   */
  constructor(vehicle: Vehicle) {
    this.vehicle = vehicle;
    this.reset();
  }

  /**
   * Reset state to baseline.
   */
  reset() {
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
      min: 0,
      max: 0,
      avg: 0
    };
    this.costs = {
      fuel: 0,
      service: 0,
      total: 0,
      running: 0,
      distance: {
        total: 0,
        running: 0
      }
    };
    this.distance = {
      actual: 0,
      total: 0,
      daily: 0,
      yearly: 0,
      predicted: {
        daily: 0,
        yearly: 0
      }
    };
    this.lastRecordDate = 0;
  }

  /**
   * Generate summary for vehicle.
   */
  summarise() {
    let min = Number.MAX_VALUE;
    let max = 0;

    let recs = this.vehicle.fuelRecs;
    let len  = 0;
    let i    = 0;
    let rec  = null;

    this.reset();
    this.costs.total = this.vehicle.purchase.price;

    if (recs && recs !== undefined && recs.length > 0) {
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
        min                 = Math.min(rec.odo, min);
        max                 = Math.max(rec.odo, max);
      }
      this.mpg.avg /= len;
      this.ppl.avg /= len;

      min = Math.min(recs[0].odo, min);
      max += recs[recs.length - 1].trip;
      this.distance.actual = max - min;
    }

    recs = this.vehicle.serviceRecs;
    if (recs && recs !== undefined) {
      len = recs.length;
      i   = 0;
      for (; i < len; i++) {
        rec = recs[i];
        this.costs.total += rec.cost;
        this.costs.service += rec.cost;
      }
    }

    this.costs.running          = this.costs.service + this.costs.fuel;
    this.costs.distance.running = this.costs.running / this.distance.actual;
    this.costs.distance.total   = this.costs.total / this.distance.actual;
  }

  /**
   * Update record with new timestamp
   * @param {number} now new date§
   */
  update(now: number) {
    let a = this.distance.actual / (this.lastRecordDate - this.vehicle.purchase.date);
    let p = this.distance.actual / ((this.vehicle.active ? now : this.lastRecordDate) - this.vehicle.purchase.date);

    this.distance.daily            = a * U.DAY_IN_MS;
    this.distance.yearly           = a * U.YEAR_IN_MS;
    this.distance.predicted.daily  = p * U.DAY_IN_MS;
    this.distance.predicted.yearly = p * U.YEAR_IN_MS;
  }
}

export {Summary as default};
