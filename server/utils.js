var moment = require('moment');

module.exports = {
	parseDate : function(dateString){	
		return moment(dateString).format('YYYY/MM/DD');
	},

	formatCost : function(cost, options){
		options = (options === undefined) ? {dp:2} : options.hash;
		options.dp = (options.dp === undefined) ? 2 : options.dp;
		
		return '£'+cost.toFixed(options.dp);
	},
	formatMPG : function(mpg){
		return mpg.toFixed(2);
	}
};
