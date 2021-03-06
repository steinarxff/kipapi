var
 	fs = require('fs'),
    readline = require('readline'),
    google = require('googleapis'),
    googleAuth = require('google-auth-library'),
	D = require('debug')('calendar'),

	SCOPES = ['https://www.googleapis.com/auth/calendar.readonly'],
    KEY_DIR = (process.env.PWD) + '/keys/',
    TOKEN_PATH = KEY_DIR + 'calendar-token.json',
	AUTHORIZED = false,
	AUTH = false;

// Load client secrets from a local file.
fs.readFile(KEY_DIR+'client_secret.json', function processClientSecrets(err, content) {
  	if (err) {
    	D('Error loading client secret file: ' + err);
    	return;
  	}
  	// Authorize a client with the loaded credentials, then call the
  	// Google Calendar API.
  	authorize(JSON.parse(content), (v)=>{ AUTH = v; AUTHORIZED = true; });
});

/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 *
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */
function authorize(credentials, callback) {
	  var clientSecret = credentials.installed.client_secret;
	  var clientId = credentials.installed.client_id;
	  var redirectUrl = credentials.installed.redirect_uris[0];
	  var auth = new googleAuth();
	  var oauth2Client = new auth.OAuth2(clientId, clientSecret, redirectUrl);

	  // Check if we have previously stored a token.
	  fs.readFile(TOKEN_PATH, function(err, token) {
		    if (err) {
		      	getNewToken(oauth2Client, callback);
		    } else {
		      	oauth2Client.credentials = JSON.parse(token);
				D('authorized');
		      	callback(oauth2Client);
		    }
	  });
}

/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 *
 * @param {google.auth.OAuth2} oauth2Client The OAuth2 client to get token for.
 * @param {getEventsCallback} callback The callback to call with the authorized
 *     client.
 */
function getNewToken(oauth2Client, callback) {
	  var authUrl = oauth2Client.generateAuthUrl({
		    access_type: 'offline',
		    scope: SCOPES
	  });

	  console.log('Authorize this app by visiting this url: ', authUrl);

	  var rl = readline.createInterface({
		    input: process.stdin,
		    output: process.stdout
	  });

	  rl.question('Enter the code from that page here: ', function(code) {
		    rl.close();

			oauth2Client.getToken(code, function(err, token) {
			      if (err) {
				        console.log('Error while trying to retrieve access token', err);
				        return;
			      }
			      oauth2Client.credentials = token;
			      storeToken(token);
			      callback(oauth2Client);
		    });
	  });
}

/**
 * Store token to disk be used in later program executions.
 *
 * @param {Object} token The token to store to disk.
 */
function storeToken(token) {
	  try {
	    	fs.mkdirSync(KEY_DIR);
	  } catch (err) {
	    	if (err.code != 'EEXIST') {
	      		throw err;
	    	}
	  }

	  fs.writeFile(TOKEN_PATH, JSON.stringify(token));
	  console.log('Token stored to ' + TOKEN_PATH);
}

var Calendar = {
	getCalendars: function(cb){
		google.calendar('v3').calendarList.list({
			auth: AUTH,
			cb
		},function(err, response) {
			if (err) {
				D('The API returned an error: ' + err);
	        	return;
	     	}

			if (events.length == 0) {
				D('No calendars returned.');
				cb([]);
			} else {
				cb(Calendar.compressCalendar(response.items));

	      	}
	  	});
 	},

	compressCalendar: function(results){
		var ret = [];
		results.each(function(item){
			ret.push({
				id: item.id,
				etag: item.etag,
				title: item.summaryOverride || item.summary
			})
		});

		return ret;
	}
};

module.exports = Calendar;
