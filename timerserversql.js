var conf			= require('./config.json');
var db				= require('./app/functions/database.js');
var onewire			= require('./app/functions/onewire.js');
var later			= require('later');
var fs				= require('fs');
var async			= require("async");
var gpio			= require('rpi-gpio');
var request			= require('request');

var SunCalc			= require('suncalc');
var suntimes		= SunCalc.getTimes(new Date(), 51.5, -0.1);

var intervals		= {};

later.date.localTime();

// var sched			=	later.parse.text('every 10 sec');
var sched			=	later.parse.text('every 1 min');
var tim				=	later.setInterval(checkTimer, sched);

checkTimer();

function checkTimer(){
	// var timers = JSON.parse(fs.readFileSync('timer.json', 'utf8'));
	var query = "SELECT * FROM timer";
	db.all(query, function(err, timers){
		if(err){
			console.log(err);
		}else{
			timers[0].conditions = JSON.parse(timers[0].conditions);
			timers[0].actions = JSON.parse(timers[0].actions);
			
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
						timer.conditions.forEach(function(condition){
							switch(condition.type){
								case "time":
									console.log("	Prüfe Zeit...");
									switch(condition.start.time){
										case "sunset":
											console.log("	Sonnenuntergang:");
											var sunset = getSuntime("sunset", condition.start.offset);
											console.log("		Schaltzeit: 	" + sunset);
											if(condition.start.time == sunset){
												console.log("		Ergebnis: 	stimmt \n");
												var switchon = true;
											}else{
												console.log("		Ergebnis: 	stimmt nicht \n");
												var switchon = false;
											}
											break;
										case "sunrise":
											console.log("	Sonnenaufgang:");
											var sunrise = getSuntime("sunrise", condition.start.offset);
											console.log("		Schaltzeit: 	" + sunrise);
											if(condition.start.time == sunrise){
												console.log("		Ergebnis: 	stimmt \n");
												var switchon = true;
											}else{
												console.log("		Ergebnis: 	stimmt nicht \n");
												var switchon = false;
											}
											break;
										default:
											console.log("	Startzeit..." + condition.start.time);
											if(condition.start.time == now){
												console.log("	Ergebnis: 	stimmt \n");
												var switchon = true;
											}else{
												console.log("	Ergebnis: 	stimmt nicht \n");
												var switchon = false;
											}
											break;
									}
									switch(condition.stop.time){
										case "sunset":
											console.log("	Sonnenuntergang:");
											var sunset = getSuntime("sunset", condition.stop.offset);
											console.log("		Schaltzeit: 	" + sunset);
											if(condition.stop.time == sunset){
												console.log("		Ergebnis: 	stimmt \n");
												var switchoff = true;
											}else{
												console.log("		Ergebnis: 	stimmt nicht \n");
												var switchoff = false;
											}
											break;
										case "sunrise":
											console.log("	Sonnenaufgang:");
											var sunrise = getSuntime("sunrise", condition.stop.offset);
											console.log("		Schaltzeit: 	" + sunrise);
											if(condition.stop.time == sunrise){
												console.log("		Ergebnis: 	stimmt \n");
												var switchoff = true;
											}else{
												console.log("		Ergebnis: 	stimmt nicht \n");
												var switchoff = false;
											}
											break;
										default:
											console.log("	Stopzeit..." + condition.stop.time);
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
										console.log("		Ergebnis: 	stimmt \n");
									} else{
										console.log("		Ergebnis: 	stimmt nicht \n");
										switchtimer = false;
									}
									break;
								case "sensor":
									console.log("	Prüfe Sensor...");
									switch(condition.condition){
										case"größer":
											if(sensorvalues[condition.sensorid].temp > condition.value){
												console.log("		Ergebnis: 	stimmt \n");
											}else{
												console.log("		Ergebnis: 	stimmt nicht \n");
												switchtimer = false;
											}
											break;
										case"kleiner":
											if(sensorvalues[condition.sensorid].temp < condition.value){
												console.log("		Ergebnis: 	stimmt \n");
											}else{
												console.log("		Ergebnis: 	stimmt nicht \n");
												switchtimer = false;
											}
											break;
										case"gleich":
											if(sensorvalues[condition.sensorid].temp = condition.value){
												console.log("		Ergebnis: 	stimmt \n");
											}else{
												console.log("		Ergebnis: 	stimmt nicht \n");
												switchtimer = false;
											}
											break;
										case"größergleich":
											if(sensorvalues[condition.sensorid].temp >= condition.value){
												console.log("		Ergebnis: 	stimmt \n");
											}else{
												console.log("		Ergebnis: 	stimmt nicht \n");
												switchtimer = false;
											}
											break;
										case"kleinergleich":
											if(sensorvalues[condition.sensorid].temp <= condition.value){
												console.log("		Ergebnis: 	stimmt \n");
											}else{
												console.log("		Ergebnis: 	stimmt nicht \n");
												switchtimer = false;
											}
											break;
										default:
											switchtimer = false;
											break;
									}
									break;
								case "gpio":
									break;
							}
						});
						if(switchtimer){
							console.log("	Bedingungen erfüllt! Schalte " + switchtimer + " \n");
						}else{
							console.log("	Bedingungen nicht erfüllt! \n");
						}
						if(switchtimer != false){
							var status = switchtimer;
							timer.actions.forEach(function(action){
								switch(action.type){
									case "interval":
										console.log("	Setze ein Interval!");
										var sched			=	later.parse.text('every ' + action.interval.number + ' ' + action.interval.unit);
										var id = action.interval.id;
										if(intervals[id] == undefined){
											switch(action.interval.action){
												case "saveSensors":
													intervals[id] = later.setInterval(onewire.saveSensors , sched);
												break;
											}
											console.log("	Neues Interval mit der id: " + id + " angelegt!\n");
										}else{
											console.log("	Interval wurde schon gesetzt!\n");
										}
										break;
									case "device":
									case "group":
									case "room":
										console.log(status);
											// status = action.status;
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
	});
}



function wochentag(i){
    var tag = (typeof(i) == 'object') ? i.getDay() : i ;
    return tag;
}

function switchaction(type, id, action){
		console.log(action);
		if(action == "on"){
			action = 1;
		}else{
			action = 0;
		}
		console.log(action);
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
function getSuntime(type, offset){
	if(type == "sunrise"){
		var suntime 		= new Date(suntimes.sunrise);
	}else{
		var suntime 		= new Date(suntimes.sunset);
	}
	var hours 		= suntime.getHours();
	var minutes 	= suntime.getMinutes();

	if(offset.number != ""){
		if(type == "sunrise"){
			console.log("		Sonnenaufgang:	" + hours + ':' + minutes);
		}else{
			console.log("		Sonnenuntergang:	" + hours + ':' + minutes);
		}
		console.log("		Offset:		" + offset.number);
		var allInMin = hours * 60 + minutes;

		if(offset.unit == "+"){
			var newTime = allInMin + parseInt(offset.number);
		}else{
			var newTime = allInMin - parseInt(offset.number);
		}

		var hours = Math.round(newTime / 60);
		var minutes = newTime % 60;
	}

	if(minutes <= 9){
		minutes = "0" + minutes;
	}
	if(hours <= 9){
		hours = "0" + hours;
	}

	var now = hours + ':' + minutes;
	return now;
}