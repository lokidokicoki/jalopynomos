'use strict';
/* @flow */
import _ from 'lodash';
import * as utils from './utils';
import * as api from './api';

/**
 * Service record holder
 * @class Sevice
 */
class Service {
  id: number;
  date: string;
  cost: number;
  odo: number;
  item: string;
  notes: string;

  /**
   * @param {object} values new service record values
   * @constructor
   */
  constructor(values: Object) {
    this.id    = -1;
    this.date  = ``;
    this.cost  = 0;
    this.odo   = 0;
    this.item  = ``;
    this.notes = ``;

    // copy constructor
    _.forEach(values, (item: any, key: string) => {
      this[key] = values[key];
    });

    if (this.id === null || this.id === undefined) {
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

export {Service as default};
