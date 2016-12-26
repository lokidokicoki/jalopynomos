'use strict';
/* @flow */
import _ from 'lodash';
import * as U from './utils';
import * as api from './api';
/**
 * Holder for fuel records
 * @class Fuel
 */
class Fuel {
  id: number;
  date: string;
  litres: number;
  ppl: number;
  trip: number;
  odo: number;
  cost: number;
  mpg: number;
  notes: string;
  type: string;

  /**
   * @param {object} values new fuel record values
   * @constructor
   */
  constructor(values: Object) {
    this.id     = -1;
    this.date   = ``;
    this.litres = 0;
    this.ppl    = 0;
    this.trip   = 0;
    this.odo    = 0;
    this.cost   = 0;
    this.mpg    = 0;
    this.notes  = ``;
    this.type   = `U`;

    // copy constructor
    _.forEach(values, (item, key) => {
      this[key] = values[key];
    });

    if (this.id === null || this.id === undefined) {
      this.id = _.size(api.getFillUps()) + 1;
    }
  }

  /**
   * Get record as string
   * @return {string}
   */
  toString() {
    // date | cost | litres | trip | odo | mpg
    let data = U.formatDate(this.date) + ` | ` +
    U.formatCost(this.cost) + ` | ` +
    this.litres + ` | ` +
    this.trip + ` | ` +
    U.formatMPG(this.mpg);

    return data;
  }

  /**
   * Calculate MPG for this record
   */
  calculateMPG() {
    this.mpg = this.trip / (this.litres / U.LITRES_IN_GALLON);
  }

  /**
   * Calculate price per litre for this record
   */
  calculatePPL() {
    this.ppl = parseFloat((this.cost / this.litres).toFixed(3));
  }
}

export {Fuel as default};
