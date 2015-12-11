var d = require('./data/records.json');
var fsx = require('fs-extra');

var k;
var v;
for (k in d.vehicles) {
  v = d.vehicles[k];
  v.purchase.date = v.purchase.date * 1000;
}
for (k in d.fillUps) {
  v = d.fillUps[k];
  v.date = v.date * 1000;
}
for (k in d.services) {
  v = d.services[k];
  v.date = v.date * 1000;
}

fsx.writeJsonSync('_records.json', d);
