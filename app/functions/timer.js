var conf			= require('./../../config.json');
var db				= require('./database.js');
var onewire			= require('./onewire.js');
var helper			= require('./helper.js');
var fs				= require('fs');
var async			= require("async");
var gpio			= require('rpi-gpio');
var request			= require('request');
var later 			= require('later');


var intervals		= {};

module.exports = {
	getTimers: function(req, res, callback){
		var query = "SELECT id, name, conditions, actions FROM timer;";
		db.all(query, function(err, data){
			if(err){
				callback(404);
				console.log(err);
			}else{				
				for(var i = 0; i< data.length; i++){
					data[i].conditions = JSON.parse(data[i].conditions);
					data[i].actions = JSON.parse(data[i].actions);
				}
				callback(data);
			}
		});
	},
	getTimer: function(id, req, res, callback){
		var query = "SELECT id, name, conditions, actions FROM timer WHERE id = " + id + ";";
		db.all(query, function(err, data){
			if(err){
				console.log(err);
				callback(404);
			}else if(data == ""){
				console.log("Keinen Timer mit der ID: " + id);
				callback(404);
			}else{
				callback(data);
			}
		});
	},
	saveNewTimer: function(data, req, res, callback){
		var query = "INSERT INTO groups (name, conditions, actions) VALUES ('" + data.name + "', '" + data.conditions + "', '" + data.actions + "');";
		db.run(query);
		callback(201);
	},
	saveEditTimer: function(data, req ,res, callback){
		console.log(data);
		var query = "UPDATE timer SET name = '" + data.name + "', conditions = '" + data.conditions + "', actions = '" + data.actions + "' WHERE id = '" + data.id + "';";
		db.run(query);
		callback(201);
	},
	deleteTimer: function(id, req, res, callback){
		var query = "DELETE FROM timer WHERE id = '" + id + "';";
		db.all(query, function(err, data){
			if(err){
				callback(err);
			}else{
				callback("200");
			}
		});
	},
	checkTimer: function(variable){
		if(!variable){
			var variable = false;
		}
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
								switch(condition.start.time){
									case "sunset":
										console.log("	Sonnenuntergang:");
										var sunset = helper.getSuntime("sunset", condition.start.offset);
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
										var sunrise = helper.getSuntime("sunrise", condition.start.offset);
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
										var sunset = helper.getSuntime("sunset", condition.stop.offset);
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
										var sunrise = helper.getSuntime("sunrise", condition.stop.offset);
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
								console.log("		" + condition.condition + " " + condition.value);
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
					
					if(timer.variable){
						console.log("	Prüfe ob Event/Variable: " + timer.variable.name + " = " + timer.variable.status + " ist");
						// console.log("		" + timer.variable.name + " = " + timer.variable.status);
						if(variable != false){
								if(timer.variable.name == variable.name && timer.variable.status == variable.status){
									console.log("		Ergebnis:	stimmt");
									console.log("				"+ variable.name +" hat den Status: "+ variable.status +"\n");
								}else{
									console.log("		Ergebnis:	stimmt");
									console.log("				"+ variable.name +" hat den Status: "+ variable.status +"\n");
									switchtimer = false;
								}
						}else if(variable == false){
							console.log("		Ergebnis: 	Kein Event für diesen Timer gemeldet!");
							switchtimer = false;
						}
					}
					
					if(switchtimer){
						console.log("	Bedingungen erfüllt! Schalte " + switchtimer + " \n");
					}else{
						console.log("	Bedingungen nicht erfüllt! \n");
					}
					if(switchtimer != false){
						var status = switchtimer;
						timer.action.forEach(function(action){
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
									status = action.status;
									switchaction(action.type, action.actionid, status);	
										
									break;
								case "saveSensors":
									onewire.saveSensors();
									break;
								case "alert":
									var url = "http://" + conf.QuickSwitch.ip + ":" + conf.QuickSwitch.port + "/alert/" + action.alert.name + "/" + action.alert.message + "/" + action.alert.type;
									console.log(url);
									request(url , function (error, response, body) {
										if (error) {
											console.log(error);
										}
									});
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
}