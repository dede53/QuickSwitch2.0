var db				= require('./app/functions/database.js');
var helper			= require('./app/functions/helper.js');
var request			= require('request');
var conf			= require('./config.json');
var later			= require('later');

var fs 					=	require('fs');
var util				=	require('util');
var log_file 			=	fs.createWriteStream(__dirname + '/log/debug-countdownserver.log', {flags : 'w'});
var log_stdout			=	process.stdout;

console.log = function(d) { //
	log_file.write(util.format(d) + '\n');
	log_stdout.write(util.format(d) + '\n');
};

checkCountdowns();

// var sched			=	later.parse.text('every 10 sec');
var sched			=	later.parse.text('every 1 min');
var tim				=	later.setInterval(checkCountdowns, sched);

function checkCountdowns(){
	var datum = new Date();
	var tag = datum.getDay();
	var hours = datum.getHours();
	var minutes = datum.getMinutes();

	if(minutes <= 9){
		minutes = "0" + minutes;
	}
	if(hours <= 9){
		hours = "0" + hours;
	}

	var now = hours + ':' + minutes;
	console.log("Es ist " + now + ". Prüfe Countdowntimer...");
	var query ="SELECT countdowns.id as id, countdowns.type as typeid, time as date, switchid, status, countdowntypen.type as type FROM countdowns, countdowntypen WHERE countdowns.type = countdowntypen.id;";
	db.all(query, function(err, countdowns){
		if(err){
			console.log(err);
		}else{
			console.log("	Es sind "+ countdowns.length + " Countdowns gesetzt...");
			countdowns.forEach(function(countdown){
				var datum = new Date(parseInt(countdown.date));
				var tag = datum.getDay();
				var hours = datum.getHours();
				var minutes = datum.getMinutes();

				if(minutes <= 9){
					minutes = "0" + minutes;
				}
				if(hours <= 9){
					hours = "0" + hours;
				}

				var switchtime = hours + ':' + minutes;
				
				console.log("		Countdown id: " + countdown.id);
				console.log("		Schaltzeit: " + switchtime);


				if(switchtime == now){
					console.log("		Schalte Countdown!\n");
					switchaction(countdown.type, countdown.switchid, countdown.status);
					
					var query="DELETE FROM countdowns WHERE id = " + countdown.id + ";";
					db.run(query);
					
				}else{
					console.log("		Stimmt nicht!\n");
				}


			});	
		}
	});
}

function switchaction(type, id, action){
	request.get({
		url:'http://' + conf.QuickSwitch.ip + ':' + conf.QuickSwitch.port + '/switch/' + type + '/' + id + '/' + action,
		form:
			{
			}
	},function( err, httpResponse, body){
		if(err){
			console.log( err , "error");
		}else{
			console.log("Erfolgreich an den SwitchServer gesendet");
		}
	});
	console.log('http://' + conf.QuickSwitch.ip + ':' + conf.QuickSwitch.port + '/switch/' + type + '/' + id + '/' + action);
}






