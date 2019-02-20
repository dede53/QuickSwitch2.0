var db				    =   require('./app/functions/database.js');
var config			    =   require('./config.json');
var later			    =   require('later');

/********************************
Log-Level:
more	|	info	1	| =  1
		|	debug	2	| >= 2
		|	warning	3	| >= 3
less	|	error	4	| >= 4
********************************/

var log = {
	"info": function(data){
		if(config.loglevel == 1 ){
			process.send({log: data});
		}
	},
	"debug": function(data){
		if(config.loglevel <= 2){
			process.send({log: data});
		}
	},
	"warning": function(data){
		if(config.loglevel <= 3){
			process.send({log: data});
		}
	},
	"error": function(data){
		if(config.loglevel <= 4){
			process.send({log: data});
		}
	},
	"pure": function(data){
		process.send({log:data});
	}
}

checkCountdowns();

var sched			=	later.parse.text('every 1 min');
var tim				=	later.setInterval(checkCountdowns, sched);

function checkCountdowns(){
	var datum   = new Date();
	var tag     = datum.getDay();
	var hours   = datum.getHours();
	var minutes = datum.getMinutes();

	if(minutes <= 9){
		minutes = "0" + minutes;
	}
	if(hours <= 9){
		hours = "0" + hours;
	}

	var now = hours + ':' + minutes;
	log.debug("	Es ist " + now + ". Prüfe Countdowntimer...");
	var query ="SELECT countdowns.id as id, countdowns.type as typeid, time as date, switchid, status, countdowntypen.type as type, user FROM countdowns, countdowntypen WHERE countdowns.type = countdowntypen.id;";
	db.all(query, function(err, countdowns){
		if(err){
			log.error(err);
		}else{
			log.debug("		Es sind "+ countdowns.length + " Countdowns gesetzt...");
			countdowns.forEach(function(countdown){
				var datum   = new Date(parseInt(countdown.date));
				var tag     = datum.getDay();
				var hours   = datum.getHours();
				var minutes = datum.getMinutes();

				if(minutes <= 9){
					minutes = "0" + minutes;
				}
				if(hours <= 9){
					hours = "0" + hours;
				}

				var switchtime = hours + ':' + minutes;
				
				log.info("			Countdown id: " + countdown.id);
				log.info("			Schaltzeit: " + switchtime);


				if(switchtime == now){
					log.info("			Schalte Countdown!\n");
					switchaction(countdown.type, countdown.switchid, countdown.status);
                    process.send({deleteCountdown:countdown});
				}else{
					log.info("			Stimmt nicht!\n");
				}
			});	
		}
	});
}


// Auf process.send umbauen!!
function switchaction(type, id, action){
    var data = {};
    data[type] = {
        action: {
            deviceid: id,
            name: ""
        },
        switchstatus: action
    }
    process.send(data);
}


process.on('disconnect', function(error){
	process.exit();
});