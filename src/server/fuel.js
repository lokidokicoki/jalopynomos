'use strict';

import _ from 'lodash';
import * as utils from './utils';
import * as api from './api';
/**
 * Holder for fuel records
 */
export class Fuel {
  id;
  date;
  litres;
  ppl;
  trip;
  odo;
  cost;
  mpg;
  notes;
  type;

  /**
   * @param {object} values new fuel record values
   * @constructor
   */
  constructor(values) {
    this.id = -1;
    this.date = 0;
    this.litres = 0;
    this.ppl = 0;
    this.trip = 0;
    this.odo = 0;
    this.cost = 0;
    this.mpg = 0;
    this.notes = ``;
    this.type = `U`;

    // copy constructor
    _.forEach(values, (item, key) => {
      this[key] = values[key];
    });

    if (this.id === null || this.id === undefined || this.id === -1) {
      this.id = _.size(api.getFillUps()) + 1;
    }
  }

  /**
   * Get record as string
   * @return {string}
   */
  toString() {
    // date | cost | litres | trip | odo | mpg
    let data = utils.formatDate(this.date) + ` | ` +
      utils.formatCost(this.cost) + ` | ` +
      this.litres + ` | ` +
      this.trip + ` | ` +
      utils.formatMPG(this.mpg);

    return data;
  }

  /**
   * Calculate MPG for this record
   */
  calculateMPG() {
    this.mpg = this.trip / (this.litres / utils.LITRES_IN_GALLON);
  }

  /**
   * Calculate price per litre for this record
   */
  calculatePPL() {
    this.ppl = parseFloat((this.cost / this.litres).toFixed(3));
  }
}
