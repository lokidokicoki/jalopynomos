var express = require('express');
var partials = require('express-partials');
var bodyParser = require('body-parser');
var fs = require('fs');
var path = require('path');
var api = require('./server/api');
var utils = require('./server/utils');
var app = express();
var hbs = require('hbs');
var oneDay = 86400000;

api.load('data/records.json');

hbs.registerHelper('getFuelType', function(type) {
    return api.getFuelType(type);
});
hbs.registerHelper('formatDate', function(dateString, isInput) {
    return utils.formatDate(dateString, isInput);
});

hbs.registerHelper('formatCost', function(cost, options) {
    return utils.formatCost(cost, options);
});

hbs.registerHelper('formatMPG', function(mpg) {
    return mpg.toFixed(2);
});

hbs.registerHelper('formatNumber', function(val, options) {
    return utils.formatNumber(val, options);
});

hbs.registerHelper('fuelSummary', function(id) {
    return api.getFillUp(id).toString();
});

hbs.registerHelper('serviceSummary', function(id) {
    return api.getService(id).toString();
});

hbs.registerHelper('log', function(obj) {
    console.log(obj);
});

hbs.registerHelper('ifeq', function(a, b, options) {
    if (a == b) {
        return options.fn(this);
    }
    return options.inverse(this);
});

hbs.registerHelper('each_with_sort', function (array, key, opts) {
    var e, i, len, s;
  array = array.sort(function(a, b) {
    a = a[key];
    b = b[key];
    if (a > b) {
      return 1;
    }
    if (a === b) {
      return 0;
    }
    if (a < b) {
      return -1;
    }
  });
  s = '';
  for (i = 0, len = array.length; i < len; i++) {
    e = array[i];
    s += opts.fn(e);
  }
  return s;
});
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'html');
app.engine('html', hbs.__express);
app.use(partials()); // use partials for layout.html
// use bodyParser
app.use(bodyParser.urlencoded({
    extended: false
}));

// parse application/json
app.use(bodyParser.json());

app.use(express.static('public', {
    maxAge: oneDay
}));


var server = app.listen('51000', function() {
    var port = server.address().port;
    console.log('express @ %s', port);
});
require('./routes')(app, api);
