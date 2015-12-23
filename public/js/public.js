/* global Highcharts */

$(function() {
  'use strict';
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
  'use strict';
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
  'use strict';
  var xaxis = [];
  var yaxis = [];
  var i = 0;
  var len = 0;
  var mpg = null;

  for (len = data.mpg.length; i < len; i++) {
    mpg = data.mpg[i];
    xaxis.push(mpg.date);
    yaxis.push(mpg.mpg);
  }

  var chartLinear = new Highcharts.Chart({
    chart: {
      zoomType: 'x',
      type: 'spline',
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
    series: [{
      id: 'mpg',
      name: vehicle.title,
      data: yaxis
    }, {
      name: 'Rolling average',
      data: data.avg
    }, {
      name: 'Linear Trendline',
      linkedTo: 'mpg',
      showInLegend: true,
      enableMouseTracking: false,
      type: 'trendline',
      algorithm: 'linear'
    }]
  });
}

/* exported buildPPLChart */
function buildPPLChart() {
  'use strict';
  $.ajax({
    url: '/ppl',
    method: 'POST',
    //async: false,
    dataType: 'json',
    success: function(res) {
      doPplChart(res.data);
    },
    error: function(e) {
      return console.error(e);
    }
  });
}

function newPplSeries(name, data) {
  'use strict';
  var i = 0;
  var len = 0;

  var series = {
    name: name,
    data: []
  };

  for (len = data.length; i < len; i++) {
    series.data.push([data[i].date, data[i].ppl]);
  }
  return series;
}

function doPplChart(data) {
  'use strict';
  var ySeries = [];
  var i = 0;

  for (i in data.data) {
    ySeries.push(newPplSeries(i, data.data[i]));
  }

  var chartLinear = new Highcharts.Chart({
    chart: {
      zoomType: 'x',
      type: 'spline',
      renderTo: 'container'
    },
    title: {
      text: 'Historic Fuel Price',
      x: -20 //center
    },
    xAxis: {
      type: 'datetime',
    },
    yAxis: {
      title: {
        text: 'Price per litre (£)'
      },
      labels: {
        format: '{value}'
      },
      plotLines: [{
        value: 0,
        width: 1,
        color: '#808080'
      }]
    },
    tooltip: {
      headerFormat: '<b>{series.name}</b><br/>',
      pointFormat: '{point.x:%e %b}: £{point.y:.3f}'
    },
    legend: {
      layout: 'vertical',
      align: 'right',
      verticalAlign: 'middle',
      borderWidth: 0
    },
    series: ySeries
  });
}

function calcTrip(oldOdo, newOdo) {
  'use strict';
  $('#trip').val(parseInt(newOdo) - oldOdo);
}

function calcPPL() {
  'use strict';
  var ppl = parseFloat($('#cost').val()) / parseFloat($('#litres').val());
  $('#ppl').val(ppl.toFixed(3));
}
