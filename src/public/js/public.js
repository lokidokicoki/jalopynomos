/* global Highcharts, $ */

$(function() {
  'use strict';
  $('#saveFillup').on('click', function() {
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


/**
 * Create chart for vehicle
 * @param  {object} vehicle of interest
 * @param  {object} data   chart data
 * @return {object} chart
 */
function doMpgChart(vehicle, data) {
  'use strict';
  var xaxis = [];
  var yaxis = [];
  var i = 0;
  var len = 0;
  var mpg = null;
  var chart = null;

  for (len = data.mpg.length; i < len; i++) {
    mpg = data.mpg[i];
    xaxis.push(mpg.date);
    yaxis.push(mpg.mpg);
  }

  chart = new Highcharts.Chart({
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

  return chart;
}

/**
 * Build chart
 * @exports buildChart
 * @param  {string} vehicleID vehicle of interest
 */
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

/**
 * Generate price per litre series
 * @param  {toString} name series name
 * @param  {array} data fuel records
 * @return {object} chart series
 */
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

/**
 * Create new HighChart for price per litre
 * @param  {object} data chart data
 * @return {object} chart
 */
function doPplChart(data) {
  'use strict';
  var ySeries = [];
  var i = 0;
  var chart = null;

  for (i in data.data) {
    ySeries.push(newPplSeries(i, data.data[i]));
  }

  chart = new Highcharts.Chart({
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
      type: 'datetime'
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

  return chart;
}

/**
 * Get chart data for price per litre
 */
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
      console.error(e);
    }
  });
}

/**
 * Calculate trip value and display
 * @param  {int} oldOdo previous value
 * @param  {int} newOdo new value
 */
function calcTrip(oldOdo, newOdo) {
  'use strict';
  $('#trip').val(parseInt(newOdo) - oldOdo);
}

/**
 * Calculate price per litre and display
 */
function calcPPL() {
  'use strict';
  var ppl = parseFloat($('#cost').val()) / parseFloat($('#litres').val());
  $('#ppl').val(ppl.toFixed(3));
}
