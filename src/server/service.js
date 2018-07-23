'use strict';

import _ from 'lodash';
import * as utils from './utils';
import * as api from './api';

/**
 * Service record holder
 */
export class Service {
  id;
  date;
  cost;
  odo;
  item;
  notes;

  /**
   * @param {object} values new service record values
   * @constructor
   */
  constructor(values) {
    this.id = -1;
    this.date = 0;
    this.cost = 0;
    this.odo = 0;
    this.item = ``;
    this.notes = ``;

    // copy constructor
    _.forEach(values, (item, key) => {
      this[key] = values[key];
    });

    if (this.id === null || this.id === undefined || this.id === -1) {
      this.id = _.size(api.getServices()) + 1;
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
      this.odo + ` | ` +
      this.item;

    return data;
  }
}
