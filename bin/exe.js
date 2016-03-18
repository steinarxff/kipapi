#!/usr/bin/env node

var express = require('express'),
  debug = require('debug')('exe'),
  db = require('./db.js'),
  calendar = require('./calendar.js'),
  app = express();

db.init();

app.use(function(req, res, next){
  req.db = db;
  next();
});

app.use('/event', require('../endpoint/event.js'));
app.use('/task', require('../endpoint/task.js'));

app.set('port', process.env.PORT || 3000);

var server = app.listen(app.get('port'), function() {
  debug('Express server listening on port ' + server.address().port);
});
