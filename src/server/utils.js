'use strict';

import moment from 'moment';
import _ from 'lodash';

const DAY_IN_MS = 86400000; //24 * 60 * 60 * 1000;
const YEAR_IN_MS = 31536000000; //356 * DAY_IN_MS;
const LITRES_IN_GALLON = 4.54609;

/**
 * Parse date from string
 * @method parseDate
 * @param {string} dateString timestamp
 * @return {number} parsed date
 */
function parseDate(dateString) {
  return moment(dateString, `YYYY-MM-DD`).valueOf();
}

/**
 * Format date
 * @method formatDate
 * @param {string} dateString date to format
 * @return {string}
 */
function formatDate(dateString) {
  return moment(dateString).format(`YYYY-MM-DD`);
}

/**
 * Format number as cost string
 * @method formatCost
 * @param {number} cost value to format
 * @param {Object=} options formatting options
 * @return {string} formatted cost
 */
function formatCost(cost, options) {
  return `£` + formatNumber(cost, options);
}

/**
 * Format value as mpg
 * @method formatMPG
 * @param {number} mpg value to format
 * @return {string} value in decimal notation
 */
function formatMPG(mpg) {
  return mpg.toFixed(2);
}

/**
 * Format number to set number of decimal places
 * @method formatNumber
 * @param {number} val value to format
 * @param {Object=} options number of dp
 * @return {string}
 */
function formatNumber(val, options) {
  options = (options === undefined) ? {
    dp: 2
  } : options.hash;
  options.dp = (options.dp === undefined) ? 2 : options.dp;

  return val.toFixed(options.dp);
}

/**
 * Ensure value passed is a number, or use default
 * @method ensureNumber
 * @param {*} value value to validate
 * @param {number} _default default value
 * @return {number} value or default
 */
function ensureNumber(value, _default) {
  value = parseFloat(value);
  return _.isNumber(value) ? value : _default;
}

/**
 * Sort records
 * @method sortRecs
 * @param {Array<*>} objects array to sort
 * @param {string} key key to sort by
 * @param {boolean} order true for ascending
 * @return {Array.<*>} sorted array
 */
function sortRecs(objects: Array<*>, key, order) {
  order = (order === undefined) ? true : order;
  objects.sort(function (a, b) {
    a = a[key];
    b = b[key];
    if (order) {
      if (a > b) {
        return 1;
      }
      if (a === b) {
        return 0;
      }
      if (a < b) {
        return -1;
      }
    } else {
      if (a < b) {
        return 1;
      }
      if (a === b) {
        return 0;
      }
      if (a > b) {
        return -1;
      }
    }
  });
  return objects;
}

export { parseDate, formatDate, formatCost, formatMPG, formatNumber, ensureNumber, sortRecs, LITRES_IN_GALLON, DAY_IN_MS, YEAR_IN_MS };
