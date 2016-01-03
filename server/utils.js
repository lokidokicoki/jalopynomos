var moment = require('moment');
var _ = require('lodash');

module.exports = {
  parseDate: function(dateString) {
    'use strict';
    return moment(dateString, 'YYYY-MM-DD').valueOf();
  },

  formatDate: function(dateString) {
    'use strict';
    return moment(dateString).format('YYYY-MM-DD');
  },

  formatCost: function(cost, options) {
    'use strict';
    return '£' + this.formatNumber(cost, options);
  },
  formatMPG: function(mpg) {
    'use strict';
    return mpg.toFixed(2);
  },
  formatNumber: function(val, options) {
    'use strict';
    options = (options === undefined) ? {
      dp: 2
    } : options.hash;
    options.dp = (options.dp === undefined) ? 2 : options.dp;

    return val.toFixed(options.dp);
  },

  ensureNumber: function(value, _default) {
    'use strict';
    value = parseFloat(value);
    return _.isNumber(value) ? value : _default;
  },

  sortRecs: function(objects, key, order) {
    'use strict';
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
};
