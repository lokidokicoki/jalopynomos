'use strict';

import _ from 'lodash';
import * as utils from './utils';
import * as api from './api';
/**
 * @param {object} values new service record values
 * @constructor
 */
class Service {
  constructor(values) {
    this.id = null;
    this.date = ``;
    this.cost = 0;
    this.odo = 0;
    this.item = ``;
    this.notes = ``;

    // copy constructor
    for (let key in values) {
      this[key] = values[key];
    }

    if (this.id === null || this.id === undefined) {
      this.id = _.size(api.getServices()) + 1;
    }
  }

  toString() {
    // date | cost | litres | trip | odo | mpg
    let data = utils.formatDate(this.date) + ` | ` +
    utils.formatCost(this.cost) + ` | ` +
    this.odo + ` | ` +
    this.item;

    return data;
  }
}

export { Service as default };
