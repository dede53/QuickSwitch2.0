process.stdin.resume();
process.env.TZ		=	'Europe/Amsterdam';


	var express			=	require('express.io');
	var app				=	express().http().io();

var conf 			=	require('./config.json');
var helper			=	require('./app/functions/helper.js');
var db				=	require('./app/functions/database.js');

var port			=	process.argv[2] || conf.QuickSwitch.port;

var dgram			=	require('dgram');
var http			=	require('http');
var util			=	require('util');
var exec			=	require('child_process').exec;
var fs 				=	require('fs');

if(!fs.existsSync("./log")){
	fs.mkdirSync("./log", 0766, function(err){
		if(err){
			console.log("mkdir ./log: failed: " + err);
		}
	});
}

var log_file 		=	fs.createWriteStream(__dirname + '/log/debug.log', {flags : 'w'});
var log_stdout		=	process.stdout;




process.on('SIGINT', function () {
	exec('forever stopall');
	process.exit();
});

console.log = function(d) {
	log_file.write(util.format(d) + '\n');
	log_stdout.write(util.format(d) + '\n');
};
/*
*/
var countdownserver 	=	exec('forever start ./countdownserver.js');
var timerserver 		=	exec('forever start ./timerserver.js');
var SwitchServer 		=	exec('forever start ./SwitchServer.js');
var eventLoader 		=	exec('forever start ./eventLoader.js');

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


app.listen(port, function(){
	helper.log("Server running at http://127.0.0.1:" + port + "/", "info");
});