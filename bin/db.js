var tungus = require('tungus'),
    mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    models = require('../models/'),
    debug = require('debug')('database');

for (var key in models) {
    if (!models.hasOwnProperty(key)) continue; // skip if not
    module.exports[key] = models[key];
}

module.exports.init = function(){
  debug("connecting to db");
  mongoose.connect('tingodb:///Users/steinar/Documents/code/kipapi/data',
    function (err) {
      if (err) throw err;
      debug("SUCCESS: database connected");
    }
  );
}
