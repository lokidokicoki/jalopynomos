var moment = require('moment');
var _ = require('lodash');

module.exports = {
    parseDate: function(dateString) {
        return moment(dateString, 'YYYY-MM-DD').valueOf();
    },

    formatDate: function(dateString) {
        return moment(dateString).format('YYYY/MM/DD');
    },

    formatCost: function(cost, options) {
        options = (options === undefined) ? {
            dp: 2
        } : options.hash;
        options.dp = (options.dp === undefined) ? 2 : options.dp;

        return '£' + cost.toFixed(options.dp);
    },
    formatMPG: function(mpg) {
        return mpg.toFixed(2);
    },

	ensureNumber: function(value, _default){
		value = parseFloat(value);
		return _.isNumber(value) ? value : _default;
	},

    sortRecs: function(objects, key, order) {
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
