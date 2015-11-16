var conf 			= require('./config.json');
var db 				= require('./app/functions/database.js');
var onewire			= require('./app/functions/onewire.js');
var later 			= require('later');
var fs 				= require('fs');
var async 			= require("async");
var intervals		= {};
						later.date.localTime();
// var sched			=	later.parse.text('every 10 sec');
var sched			=	later.parse.text('every 1 min');
var tim				=	later.setInterval(checkTimer, sched);
onewire.saveSensors();


function checkTimer(){
	var timers = JSON.parse(fs.readFileSync('timer.json', 'utf8'));

	var query = "SELECT * FROM sensor_data GROUP BY nodeid DESC";
	db.all(query, function(err, data){
		if(err){
			console.log("Fehler beim abrufen der Sensordaten! " + err);
		}else{
			var sensorvalues = {};
			data.forEach(function(sensor){
				sensorvalues[sensor.nodeid] = sensor;
			});

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

			console.log("Es ist: " + now + "h \n");
			
			timers.forEach(function(timer){
				var switchtimer = true;
				
				console.log("Prüfe Timer: " + timer.name);
				timer.condition.forEach(function(condition){
					switch(condition.type){
						case "time":
							console.log("	Prüfe Zeit...");
							console.log("	Startzeit..." + condition.start.time);
							switch(condition.start.time){
								case "sunset":
									break;
								case "sunrise":
									break;
								default:
									if(condition.start.time == now){
										console.log("	Ergebnis: 	stimmt \n");
										var switchon = true;
									}else{
										var switchon = false;
										console.log("	Ergebnis: 	stimmt nicht \n");
									}
									break;
							}
							console.log("	Stopzeit..." + condition.stop.time);
							switch(condition.stop.time){
								case "sunset":
									break;
								case "sunrise":
									break;
								default:
									if(condition.stop.time == now){
										console.log("	Ergebnis: 	stimmt \n");
										switchoff = true;
									}else{
										console.log("	Ergebnis: 	stimmt nicht \n");
										switchoff = false;
									}
									break;
							}
								if(switchon == true && switchoff == true){
									console.log("error: Beide schaltzeiten sind gleich!");
									switchtimer = false;
								}else if(switchon == true){
									switchtimer = "on";
								}else if(switchoff == true){
									switchtimer = "off";
								}else{
									switchtimer = false;
								}
							break;
						case "weekdays":
							console.log("	Prüfe Wochentag...");
							if(condition.weekdays[tag] == 1){
								console.log("	Ergebnis: 	stimmt \n");
							} else{
								console.log("	Ergebnis: 	stimmt nicht \n");
								switchtimer = false;
							}
							break;
						case "sensor":
							console.log("	Prüfe Sensor...");
							switch(condition.condition){
								case"größer":
									if(sensorvalues[condition.sensorid].temp > condition.value){
										console.log("	Ergebnis: 	stimmt \n");
									}else{
										console.log("	Ergebnis: 	stimmt nicht \n");
										switchtimer = false;
									}
									break;
								case"kleiner":
									if(sensorvalues[condition.sensorid].temp < condition.value){
										console.log("	Ergebnis: 	stimmt \n");
									}else{
										console.log("	Ergebnis: 	stimmt nicht \n");
										switchtimer = false;
									}
									break;
								case"gleich":
									if(sensorvalues[condition.sensorid].temp = condition.value){
										console.log("	Ergebnis: 	stimmt \n");
									}else{
										console.log("	Ergebnis: 	stimmt nicht \n");
										switchtimer = false;
									}
									break;
								case"größergleich":
									if(sensorvalues[condition.sensorid].temp >= condition.value){
										console.log("	Ergebnis: 	stimmt \n");
									}else{
										console.log("	Ergebnis: 	stimmt nicht \n");
										switchtimer = false;
									}
									break;
								case"kleinergleich":
									if(sensorvalues[condition.sensorid].temp <= condition.value){
										console.log("	Ergebnis: 	stimmt \n");
									}else{
										console.log("	Ergebnis: 	stimmt nicht \n");
										switchtimer = false;
									}
									break;
								default:
									switchtimer = false;
									break;
							}
							break;
					}
				});
				if(switchtimer){
					console.log("Bedingungen erfüllt! Schalte " + switchtimer + " \n");
				}else{
					console.log("Bedingungen nicht erfüllt! \n");
				}
				if(switchtimer != false){
					var status = switchtimer;
					timer.action.forEach(function(action){
						switch(action.type){
							case "interval":
								console.log("Setze ein Interval!");
								var sched			=	later.parse.text('every ' + action.interval.number + ' ' + action.interval.unit);
								//var sched			=	later.parse.text('every 1 min');
								var id = action.interval.id;
								if(intervals[id] == undefined){
									switch(action.interval.action){
										case "saveSensors":
											intervals[id] = later.setInterval(onewire.saveSensors , sched);
										break;
									}
									console.log("Neues Interval mit der id: " + id + " angelegt!");
								}else{
									console.log("Interval wurde schon gesetzt!");
								}
								break;
							case "device":
							case "group":
							case "room":
								switchaction(action.type, action.actionid, status);	
								break;
							case "saveSensors":
								onewire.saveSensors();
								break;
							default:
								console.log(action.type);
								break;
						}
					});
				}
			});

		}
	});
}



function wochentag(i){
    var tag = (typeof(i) == 'object') ? i.getDay() : i ;
    return tag;
}

function switchaction(type, id, action){
		if(action == "on"){
			action = 1;
		}else{
			action = 0;
		}
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
}
