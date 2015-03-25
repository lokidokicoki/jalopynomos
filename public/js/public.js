$(function() {
    $('#saveFillup').on('click', function(e) {
        console.log('get form data');
        $.ajax({
            url: '/saveFillup',
            type: 'POST',
            data: {
                name: 'bobo'
            },
            success: function(res) {
                return console.log(res);
            },
            error: function(e) {
                return console.error(e);
            }
        });
    });
});



function buildChart(vehicleID) {
	//console.log('buildChart:',vehicleID);
    $.ajax({
        url: '/mpg',
        method: 'POST',
        //async: false,
        dataType: 'json',
        data: {
            vid: vehicleID
        },
        success: function(res) {
            doMpgChart(res.vehicle, res.data);
        },
        error: function(e) {
            return console.error(e);
        }
    });
}

function doMpgChart(vehicle, data) {

	var xaxis = [];
	var yaxis = [];
	var i=0,len=0, mpg=null;

	for (i=0,len=data.mpg.length;i<len;i++){
		mpg=data.mpg[i];
		xaxis.push(mpg.date);
		yaxis.push(mpg.mpg);
	}

    var chart_linear = new Highcharts.Chart({
		chart:{
			zoomType:'x',
			type:'spline',
			renderTo: 'container'
		},
        title: {
            text: 'MPG',
            x: -20 //center
        },
        xAxis: {
			type: 'datetime',
            categories: xaxis
        },
        yAxis: {
            title: {
                text: 'Miles per gallon'
            },
            plotLines: [{
                value: 0,
                width: 1,
                color: '#808080'
            }]
        },
        tooltip: {
            valueSuffix: 'mpg'
        },
        legend: {
            layout: 'vertical',
            align: 'right',
            verticalAlign: 'middle',
            borderWidth: 0
        },
        series: [
		{
            name: vehicle.title,
            data: yaxis
        },
		{
			name: 'Rolling average',
			data: data.avg
		}
		]
    });


	/* add regression line dynamically */
      chart_linear.addSeries({
        type: 'line',
        marker: { enabled: false },
        /* function returns data for trend-line */
        data: (function() {
          return fitOneDimensionalData(yaxis);
        })()
      });
      function fitOneDimensionalData(source_data) {
        var trend_source_data = [];
        for(var i = source_data.length; i-->0;) {
          trend_source_data[i] = [i, source_data[i]];
        }
        var regression_data = fitData(trend_source_data).data;
        var trend_line_data = [];
        for(i = regression_data.length; i-->0;) {
          trend_line_data[i] = regression_data[i][1];
        }
        return trend_line_data;
      }
}
