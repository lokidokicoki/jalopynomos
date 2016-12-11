'use strict';
import moment from 'moment';
import _ from 'lodash';

const DAY_IN_MS = 86400000; //24 * 60 * 60 * 1000;
const YEAR_IN_MS = 31536000000; //356 * DAY_IN_MS;
const LITRES_IN_GALLON = 4.54609;

function parseDate(dateString) {
  return moment(dateString, `YYYY-MM-DD`).valueOf();
}

function formatDate(dateString) {
  return moment(dateString).format(`YYYY-MM-DD`);
}

function formatCost(cost, options) {
  return `£` + formatNumber(cost, options);
}
function formatMPG(mpg) {
  return mpg.toFixed(2);
}
function formatNumber(val, options) {
  options = (options === undefined) ? {
    dp: 2
  } : options.hash;
  options.dp = (options.dp === undefined) ? 2 : options.dp;

  return val.toFixed(options.dp);
}

function ensureNumber(value, _default) {
  value = parseFloat(value);
  return _.isNumber(value) ? value : _default;
}

function sortRecs(objects, key, order) {
  order = (order === undefined) ? true : order;
  objects.sort(function(a, b) {
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

export {parseDate, formatDate, formatCost, formatMPG, formatNumber, ensureNumber, sortRecs, LITRES_IN_GALLON, DAY_IN_MS, YEAR_IN_MS};
