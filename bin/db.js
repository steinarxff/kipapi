var tungus = require('tungus'),
    mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    models = require('../models/'),

    calendar = require('./calendar.js'),
    D = require('debug')('database');

for (var key in models) {
    if (!models.hasOwnProperty(key)) continue; // skip if not
	D('Model: ' + key);
    module.exports[key] = models[key];
}

module.exports.init = function(){
  D("connecting to db");
  mongoose.connect('tingodb:///Users/steinar/Documents/code/kipapi/data',
    function (err) {
      if (err) throw err;
      D("SUCCESS: database connected");
    }
  );
}
