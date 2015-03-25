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

	for (i=0,len=data.length;i<len;i++){
		mpg=data[i];
		xaxis.push(mpg.date);
		yaxis.push(mpg.mpg);
	}

    $('#container').highcharts({
		chart:{
			zoomType:'x',
			type:'spline',
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
        series: [{
            name: vehicle.title,
            data: yaxis
        }]
    });
}
