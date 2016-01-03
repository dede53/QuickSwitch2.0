// set timezone
process.env.TZ		=	'Europe/Amsterdam';

var conf 			=	require('./config.json');

var express			=	require('express.io');
var app				=	express().http().io();

var db				=	require('./app/functions/database.js');

var port			=	process.argv[2] || conf.QuickSwitch.port;

var dgram				=	require('dgram');
var http				=	require('http');
var util				=	require('util');
var exec				=	require('child_process').exec;
var fs 					=	require('fs');

var log_file 			=	fs.createWriteStream(__dirname + '/debug.log', {flags : 'w'});
var log_stdout			=	process.stdout;

console.log = function(d) { //
  log_file.write(util.format(d) + '\n');
  log_stdout.write(util.format(d) + '\n');
};
/*
*/

var countdownserver = exec('forever start ./countdownserver.js');
countdownserver.stdout.on('data', function(data) {
    console.log(data);
});
countdownserver.stderr.on('data', function(data) {
    console.log(data);
});
countdownserver.on('close', function(code) {
    console.log(code);
});

var timerserver = exec('forever start ./timerserver.js');
timerserver.stdout.on('data', function(data) {
	console.log("timerserver Daten!!");
    console.log(data );
});
timerserver.stderr.on('data', function(data) {
    console.log(data);
});
timerserver.on('close', function(code) {
    console.log(code);
});

var SwitchServer = exec('forever start ./SwitchServer.js');
SwitchServer.stdout.on('data', function(data) {
    console.log(data );
});
SwitchServer.stderr.on('data', function(data) {
    console.log(data);
});
SwitchServer.on('close', function(code) {
    console.log(code);
});

var bodyParser			=	require('body-parser');
var cookieParser		=	require('cookie-parser');
var multer				=	require('multer');
var cookies				=	{};

// app.use(express.logger('dev'));
app.use(bodyParser.json()); 						// for parsing application/json
app.use(bodyParser.urlencoded({ extended: true }));	// for parsing application/x-www-form-urlencoded
app.use(multer()); 									// for parsing multipart/form-data
app.use(cookieParser());							// for parsing cookies
app.use(express.static(__dirname + '/public'));		// provides static html

require('./app/routes')(app, db);

var helper = require('./app/functions/helper.js');

require('./app/ioroutes/countdown.js')(app, db);
require('./app/ioroutes/device.js')(app, db);
require('./app/ioroutes/group.js')(app, db);
require('./app/ioroutes/message.js')(app, db);
require('./app/ioroutes/room.js')(app, db);
require('./app/ioroutes/user.js')(app, db);
require('./app/ioroutes/timer.js')(app, db);
require('./app/ioroutes/temperature.js')(app, db);
require('./app/ioroutes/phone.js')(app, db);

// Start server
app.listen(port);
helper.log("Server running at http://127.0.0.1:" + port + "/", "info");