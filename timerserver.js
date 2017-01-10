var timerFunctions	= require('./app/functions/timer.js');

var later			= require('later');

later.date.localTime();

// var sched			=	later.parse.text('every 10 sec');
var sched				=	later.parse.text('every 1 min');
var tim					=	later.setInterval(timerFunctions.checkTimer, sched);

var util				=	require('util');
var fs 					=	require('fs');

var log_file			=	fs.createWriteStream(__dirname + '/log/debug-timerserver.log', {flags : 'w'});
var log_stdout			=	process.stdout;

console.log = function(d) {
	log_file.write(util.format(d) + '\n');
	log_stdout.write(util.format(d) + '\n');
};

timerFunctions.checkTimer();