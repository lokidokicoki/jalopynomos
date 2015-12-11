var express = require('express');
var partials = require('express-partials');
var bodyParser = require('body-parser');
var path = require('path');
var api = require('./server/api');
var utils = require('./server/utils');
var app = express();
var hbs = require('hbs');
var oneDay = 86400000;

api.load('data/records.json');

hbs.registerHelper('getFuelType', function(type) {
  'use strict';
  return api.getFuelType(type);
});
hbs.registerHelper('formatDate', function(dateString, isInput) {
  'use strict';
  return utils.formatDate(dateString, isInput);
});

hbs.registerHelper('formatCost', function(cost, options) {
  'use strict';
  return utils.formatCost(cost, options);
});

hbs.registerHelper('formatMPG', function(mpg) {
  'use strict';
  return mpg.toFixed(2);
});

hbs.registerHelper('formatActive', function(val, isInput) {
  'use strict';
  if (isInput && isInput !== undefined) {
    return (val) ? 'checked' : '';
  } else {
    return (val) ? 'Active' : 'Sold';
  }
});

hbs.registerHelper('formatNumber', function(val, options) {
  'use strict';
  return utils.formatNumber(val, options);
});

hbs.registerHelper('fuelSummary', function(id) {
  'use strict';
  return api.getFillUp(id).toString();
});

hbs.registerHelper('serviceSummary', function(id) {
  'use strict';
  return api.getService(id).toString();
});

hbs.registerHelper('log', function(obj) {
  'use strict';
  console.log(obj);
});

hbs.registerHelper('ifeq', function(a, b, options) {
  'use strict';
  if (a === b) {
    return options.fn(this);
  }
  return options.inverse(this);
});

hbs.registerHelper('each_with_sort', function(array, key, opts) {
  'use strict';
  var e;
  var i = 0;
  var len;
  var s;
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
  for (len = array.length; i < len; i++) {
    e = array[i];
    s += opts.fn(e);
  }
  return s;
});
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
app.engine('hbs', hbs.__express);
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
  'use strict';
  var port = server.address().port;
  console.log('express @ %s', port);
});
require('./routes')(app, api);
