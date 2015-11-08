process.env.TZ		=	'Europe/Amsterdam';

var conf 			=	require('./config.json');
var express			=	require('express.io');
var app				=	express().http().io();
var db				=	require('./app/functions/database.js');
var port			=	process.argv[2] || conf.QuickSwitch.port;


var exec				=	require('exec');
var dgram				=	require('dgram');
var http				=	require('http');
var util				=	require('util');
var exec				=	require('child_process').exec;
var sleep				=	require('sleep');
var bodyParser			=	require('body-parser');
var cookieParser		=	require('cookie-parser');
var multer				=	require('multer');
var cookies				=	{};




app.use(bodyParser.json()); 						// for parsing application/json
app.use(bodyParser.urlencoded({ extended: true }));	// for parsing application/x-www-form-urlencoded
app.use(multer()); 									// for parsing multipart/form-data
app.use(cookieParser());							// for parsing cookies
app.use(express.static(__dirname + '/public'));		// provides static html




/*********************************************************
* Sendet die der aktiven Geräte
*********************************************************/



function getSensorvalues(id, date, req, res, callback) {
	var query = "SELECT time, temp / 100  as temp FROM      sensor_data WHERE     strftime('%M', time / 1000, 'unixepoch') == '00' AND       strftime('%S', time / 1000, 'unixepoch') < '04' AND       strftime('%S', time / 1000, 'unixepoch') >= '00';";
	db.all(query, function(err, row) {
		if (err) {
			console.log(err);
			callback(404);
		} else if (row === "") {
			callback("Keine Daten für den Sensor mit der ID" + id);
			console.log("Keine Daten für den Sensor mit der ID" + id);
		} else {
			callback(row);
		}
	});
}







// load the routes
require('./app/routes')(app, db);



var helper = require('./app/functions/helper.js');


require('./app/ioroutes/SwitchServer.js');
require('./app/ioroutes/countdown.js')(app, db);
require('./app/ioroutes/device.js')(app, db);
require('./app/ioroutes/group.js')(app, db);
require('./app/ioroutes/message.js')(app, db);
require('./app/ioroutes/room.js')(app, db);
require('./app/ioroutes/user.js')(app, db);
require('./app/ioroutes/temperature.js')(app, db);

// Start server
app.listen(port);
helper.log("Server running at http://127.0.0.1:" + port + "/", "info");