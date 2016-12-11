'use strict';
import * as U from './utils';
/**
 * @param {object} values new fuel record values
 * @constructor
 */
export class Fuel {
  constructor(values) {
    this.id = null;
    this.date = ``;
    this.litres = 0;
    this.ppl = 0;
    this.trip = 0;
    this.odo = 0;
    this.cost = 0;
    this.mpg = 0;
    this.notes = ``;
    this.type = `U`;

    // copy constructor
    for (let key in values) {
      this[key] = values[key];
    }

    if (this.id === null || this.id === undefined) {
      this.id = _.size(fillUps) + 1;
    }
  }

  get toString() {
    // date | cost | litres | trip | odo | mpg
    let data = U.formatDate(this.date) + ` | ` +
    U.formatCost(this.cost) + ` | ` +
    this.litres + ` | ` +
    this.trip + ` | ` +
    U.formatMPG(this.mpg);

    return data;
  }

  calculateMPG() {
    this.mpg = this.trip / (this.litres / U.LITRES_IN_GALLON);
  }

  calculatePPL() {
    this.ppl = parseFloat((this.cost / this.litres).toFixed(3));
  }
}
