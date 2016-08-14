process.stdin.resume();
process.env.TZ		=	'Europe/Amsterdam';

// Killt alles was node heißt:
// ps -ef | grep node | grep -v grep | awk '{print $2}' | xargs kill -9

var express			=	require('express.io');
var app				=	express().http().io();
var conf			=	require('./config.json');
var helper			=	require('./app/functions/helper.js');
var db				=	require('./app/functions/database.js');

var port			=	process.argv[2] || conf.QuickSwitch.port;

var localDirName	=	__dirname;

var fork			=	require('child_process').fork;
var dgram			=	require('dgram');
var http			=	require('http');
var util			=	require('util');
var fs 				=	require('fs');
var spawn			=	require('child_process').spawn;


app.listen(port);
helper.log.info("Server running at http://127.0.0.1:" + port + "/");

if(!fs.existsSync("./log")){
	fs.mkdirSync("./log", 0766, function(err){
		if(err){
			console.log("mkdir ./log: failed: " + err);
		}
	});
}

var plugins = {};
var log_file = {};
var data = [
	"autoloader.js",
	"timerserver.js",
	"countdownserver.js",
	"eventLoader.js",
];

data.forEach(function(file){
	var splitedfile = file.split(".");
	var filename = splitedfile[0];
	var debugFile = __dirname + '/log/debug-' + filename + '.log';
	log_file[filename]			=	fs.createWriteStream( debugFile, {flags : 'w'});	

	plugins[filename] = fork( './' + file );
	plugins[filename].on('message', function(response) {
		log_file[filename].write(response.toString());
	});
});


var bodyParser			=	require('body-parser');
var cookieParser		=	require('cookie-parser');
var multer				=	require('multer');

// app.use(express.logger('dev'));
app.use(bodyParser.json()); 						// for parsing application/json
app.use(bodyParser.urlencoded({ extended: true }));	// for parsing application/x-www-form-urlencoded
app.use(multer()); 									// for parsing multipart/form-data
app.use(cookieParser());							// for parsing cookies
app.use(express.static(__dirname + '/public'));		// provides static html

require('./app/routes')(app, db);


require('./app/ioroutes/countdown.js')(app, db);
require('./app/ioroutes/device.js')(app, db);
require('./app/ioroutes/group.js')(app, db);
require('./app/ioroutes/message.js')(app, db);
require('./app/ioroutes/room.js')(app, db);
require('./app/ioroutes/user.js')(app, db);
require('./app/ioroutes/timer.js')(app, db);
require('./app/ioroutes/temperature.js')(app, db);
require('./app/ioroutes/phone.js')(app, db);
require('./app/ioroutes/variable.js')(app, db);
require('./app/ioroutes/settings.js')(app, db);