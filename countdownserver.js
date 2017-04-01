var db				= require('./app/functions/database.js');
var helper			= require('./app/functions/helper.js');
var request			= require('request');
var conf			= require('./config.json');
var later			= require('later');

var fs 					=	require('fs');
var util				=	require('util');
var log_file 			=	fs.createWriteStream(__dirname + '/log/debug-countdownserver.log', {flags : 'w'});
var log_stdout			=	process.stdout;

var settings 		= {
	loglevel: 4
}
/********************************
Log-Level:
more	|	info	1	| =  1
		|	debug	2	| >= 2
		|	warning	3	| >= 3
less	|	error	4	| >= 4
********************************/

var log = {
	"info": function(data){
		if(settings.loglevel == 1 ){
			try{
				if(typeof data === "object"){
					var data = JSON.stringify(data);
				}else{
					var data = data.toString();
				}
				log_file.write(new Date() +":"+ data + '\n');
			}catch(e){}
		}
	},
	"debug": function(data){
		if(settings.loglevel <= 2){
			try{
				if(typeof data === "object"){
					var data = JSON.stringify(data);
				}else{
					var data = data.toString();
				}
				log_file.write(new Date() +":"+ data + '\n');
			}catch(e){}
		}
	},
	"warning": function(data){
		if(settings.loglevel <= 3){
			try{
				if(typeof data === "object"){
					var data = JSON.stringify(data);
				}else{
					var data = data.toString();
				}
				log_file.write(new Date() +":"+ data + '\n');
			}catch(e){}
		}
	},
	"error": function(data){
		if(settings.loglevel <= 4){
			try{
				if(typeof data === "object"){
					var data = JSON.stringify(data);
				}else{
					var data = data.toString();
				}
				log_file.write(new Date() +":"+ data + '\n');
			}catch(e){}
		}
	},
	"pure": function(data){
		console.log(data);
	}
}


console.log = function(d) {
	log_file.write(util.format(d) + '\n');
	log_stdout.write(util.format(d) + '\n');
};

checkCountdowns();

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
	log.debug("Es ist " + now + ". Prüfe Countdowntimer...");
	var query ="SELECT countdowns.id as id, countdowns.type as typeid, time as date, switchid, status, countdowntypen.type as type, user FROM countdowns, countdowntypen WHERE countdowns.type = countdowntypen.id;";
	db.all(query, function(err, countdowns){
		if(err){
			log.error(err);
		}else{
			log.debug("	Es sind "+ countdowns.length + " Countdowns gesetzt...");
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
				
				log.info("		Countdown id: " + countdown.id);
				log.info("		Schaltzeit: " + switchtime);


				if(switchtime == now){
					log.info("		Schalte Countdown!\n");
					switchaction(countdown.type, countdown.switchid, countdown.status);

					request.get({
						url:'http://' + conf.QuickSwitch.ip + ':' + conf.QuickSwitch.port + '/countdown/' + countdown.id + "/" + countdown.user
					},function( err, httpResponse, body){
						if(err){
							log.error( err , "error");
						}else{
							log.info("Erfolgreich an den SwitchServer gesendet");
						}
					});
				}else{
					log.info("		Stimmt nicht!\n");
				}


			});	
		}
	});
}

function switchaction(type, id, action){
	request.get({
		url:'http://' + conf.QuickSwitch.ip + ':' + conf.QuickSwitch.port + '/switch/' + type + '/' + id + '/' + action
	},function( err, httpResponse, body){
		if(err){
			log.error( err , "error");
		}else{
			log.info("Erfolgreich an den SwitchServer gesendet");
		}
	});
}






