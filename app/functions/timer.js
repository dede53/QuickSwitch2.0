/*
var bla = [
	{
		'name':'Sensoren speichern',
		'variables':{
			'Daniel-Home':[{
				"name":"Daniel-Home",
				"status":"true",
				"mode":"match"
			}]
		},
		'conditions':{
			'time': [
				{
					"start": {
						"time": "06:44",
						"offset": {
							"number": "",
							"unit": ""
						}
					},
					"stop": {
						"time": "sunrise",
						"offset": {
							"number": "120",
							"unit": "+"
						}
					}
				}
			],
			'range': [
				{
					'start':{
						'time':'18:30'
					},
					'stop':{
						'time':'20:00'
					}
				}
			],
			'weekdays':[
				{
					"0":1,
					"1":1,
					"2":1,
					"3":1,
					"4":1,
					"5":1,
					"6":1
				}
			],
			'variables':[
				{
					'name':'Daniel',
					'value':'12',
					"condition":"größergleich"
				}
			]
		},
		'actions':{
			'devices':[
				{
					'name':'Schreibtisch',
					'id':'1',
				}
			],
			'groups':[
				{
					'name':'Chillen',
					'id':1
				}
			],
			'rooms':[
				{
					'name':'...'
				}
			],
			"alerts":[
				{
					'name':'...'
				}
			]
		},
	}
];
*/
var conf					= require('./../../config.json');
var db						= require('./database.js');
var helper					= require('./helper.js');
var variableFunctions		= require('./variable.js');
var fs						= require('fs');
var async					= require("async");
var request					= require('request');
var later 					= require('later');
var allIntervals				= {
	setInterval: function(id, callback, sched){
		this.intervals[id] = later.setInterval(callback, sched);
	},
	clearInterval: function(id){
		this.intervals[id].clear();
		delete this.intervals[id];
	},
	intervals: {}
};
var storedTimes 			= {};
function isObjectEmpty(value){
    return Boolean(value && typeof value == 'object') && !Object.keys(value).length;
}

function getRandomInt(min, max) {
	return Math.floor(Math.random() * (max - min)) + min;
}
function parseTime(time){
	var time 		= time.split(':');
	return createTime(new Date().setHours(time[0], time[1]));
}
function createTime(time){
	time = new Date(parseInt(time));
	time.setMilliseconds(0);
	time.setSeconds(0);
	var minutes = ("0" + time.getMinutes()).slice(-2);
	var hours = ("0" + time.getHours()).slice(-2);
	return {
		timestamp: time.getTime(),
		hours: time.getHours(),
		minutes: time.getMinutes(),
		time: hours + ':' + minutes
	}
}
function deaktivateInterval(id){
	getTimer(id, function(timer){
		if(timer.actions.intervals){
			timer.actions.intervals.forEach(function(interval){
				helper.log.debug("Interval mit der ID:" + interval.id + " deaktiviert");
				allIntervals.intervals[interval.id].clear();
				delete allIntervals.intervals[interval.id];
			});
		}
	});
}
function deleteTimer(id, callback){
	var query = "DELETE FROM timer WHERE id = '" + id + "';";
	db.all(query, function(err, data){
		callback(err, data);
	});
}
var checkConditions = function(timer, switchToThis, switchtimer, callback){
		// helper.log.debug(timer.conditions);
		if(switchtimer == false || switchtimer == "false"){
			return;
		}
		if(!timer.conditions){
			helper.log.pure("	Keine Bedingungen für diesen Timer");
			helper.log.pure("		Ergebnis: 	stimmt");
			callback(timer, switchToThis, switchtimer);
			return;
		}
		
		// Wenn noch nie ausgeführt dann letzte Ausführung auf vor 12 Stunden setzten
		if(!timer.lastexec){
			timer.lastexec = new Date().getTime() - 12 * 60 * 60000;
		}else{
			timer.lastexec = parseInt(timer.lastexec);
		}

		var switchNow = null;

		if(timer.conditions.range){
			helper.log.pure("	Prüfe Zeitraum...");
			timer.conditions.range.forEach(function(condition){
				helper.log.pure("		" + condition.start + " - " + condition.stop);
				var startTime = parseTime(condition.start);
				var stopTime = parseTime(condition.stop);
				
				if(helper.isTimeInRange(startTime.timestamp, stopTime.timestamp)){
					switchNow = true;
					helper.log.pure("		Ergebnis: 	stimmt \n");
				}else{
					helper.log.pure("		Ergebnis: 	stimmt nicht \n");
					switchtimer = false;
				}
			});
		}

		if(timer.conditions.time){
			var now = createTime(new Date().getTime());


			console.log("Prüfe Zeit...");

			timer.conditions.time.forEach(function(condition){
				switch(condition.time){
					case "sunset":
						console.log("	Sonnenuntergang:");
						var newTime = helper.getSuntime("sunset", condition.offset);
						console.log("		Schaltzeit: 	" + newTime.time);
						if(newTime.time == now.time){
							if(timer.lastexec < newTime.timestamp){
								console.log("		Ergebnis: 	stimmt \n");
								switchNow = true;
								switchToThis = condition.action;
							}else{
								helper.log.pure('Timer wurde schon geschaltet');
								switchtimer = false;
							}
						}else{
							console.log("		Ergebnis: 	stimmt nicht \n");
							switchtimer = false;
						}
						break;
					case "sunrise":
						console.log("	Sonnenaufgang:");
						var newTime = helper.getSuntime("sunrise", condition.offset);
						console.log("		Schaltzeit: 	" + newTime.time);
						if(newTime.time == now.time){
							if(timer.lastexec < newTime.timestamp){
								console.log("		Ergebnis: 	stimmt \n");
								switchNow = true;
								switchToThis = condition.action;
							}else{
								helper.log.pure('Timer wurde schon geschaltet');
								switchtimer = false;
							}
						}else{
							console.log("		Ergebnis: 	stimmt nicht \n");
							switchtimer = false;
						}
						break;
					default:
						condition.time = parseTime(condition.time);
						console.log("	Schaltzeit..." + condition.time.time);
						if(condition.time.time == now.time){
							if(timer.lastexec < condition.time.timestamp){
								console.log("		Ergebnis: 	stimmt \n");
								switchNow = true;
								switchToThis = condition.action;
							}else{
								helper.log.pure('Timer wurde schon geschaltet');
								switchtimer = false;
							}
						}else{
							console.log("		Ergebnis: 	stimmt nicht \n");
							switchtimer = false;
						}
						break;
				}
			});
		}
		if(timer.conditions.random){
			helper.log.pure("Prüfe Zufallszeit...");

			timer.conditions.random.forEach(function(condition){
				var now = createTime(new Date().getTime());
				var startTime = parseTime(condition.start);
				var stopTime = parseTime(condition.stop);

				// Zeitraum prüfen
				if(startTime.timestamp <= now.timestamp && stopTime.timestamp >= now.timestamp){
					if(timer.lastexec > startTime.timestamp && timer.lastexec < stopTime.timestamp){
						// schon ausgeführt!
						helper.log.pure("	Timer schon ausgeführt");
						helper.log.pure("		Ergebnis: 	stimmt nicht \n");
						switchtimer = false;
					}else{
						// Noch nicht ausgeführt!
						if(!storedTimes[timer.id]){
							// Timestamp zum Schalten generieren
							var minutes = getRandomInt(now.timestamp, stopTime.timestamp);
							// helper.log.pure(new Date(minutes));
							storedTimes[timer.id] = createTime(minutes);
							helper.log.pure('	Neue Schaltzeit berechnet!');
						}
						helper.log.pure('	Schaltzeit:' + new Date(storedTimes[timer.id].timestamp));
						if(storedTimes[timer.id].time == now.time){
							// Schalten!!
							helper.log.pure('	Jetzt schalten!');
							storedTimes[timer.id] = false;
							helper.log.pure("		Ergebnis: 	stimmt \n");
							switchNow = true;
							switchToThis = condition.action;
						}else{
							helper.log.pure('		Ergebnis: 	stimmt nicht \n');
							switchtimer = false;
						}
					}
				}else{
					helper.log.pure("	Uhrzeit nicht zwischen " + startTime.time + " und " + stopTime.time);
					helper.log.pure("		Ergebnis: 	stimmt nicht \n");
					switchtimer = false;
				}
					
			});
		}

		// if(timer.conditions.variables){
		// 	timer.conditions.variables.forEach(function(varToCheck){
		// 		variableFunctions.getVariableByName(varToCheck.name, function(fullVariable){
		// 			compareVariables(varToCheck, fullVariable);
		// 		});
		// 	});
		// }
		if(switchNow == true){
			switchtimer = true;
		}

		if(timer.conditions.weekdays){
			var datum = new Date();
			var tag = datum.getDay();

			helper.log.pure("	Prüfe Wochentag...");
			timer.conditions.weekdays.forEach(function(condition){
				if(condition[tag] == 1){					
					// switchNow = true;
					helper.log.pure("		Ergebnis: 	stimmt \n");
				}else{
					helper.log.pure("		Ergebnis: 	stimmt nicht \n");
					switchtimer = false;
				}
			});
		}
		callback(timer, switchToThis, switchtimer);
}
function getTimer(id, callback){
	var query = "SELECT id, name, active, variables, conditions, actions, user, lastexec FROM timer WHERE id = " + id + ";";
	db.all(query, function(err, data){
		if(err){
			helper.log.pure(err);
		}else if(data == ""){
			helper.log.error("Keinen Timer mit der ID: " + id);
		}else{
			try{
				if(data[0].variables != ""){
					data[0].variables = JSON.parse(data[0].variables.trim());
				}else{
					data[0].variables = false;
				}
				if(data[0].conditions != ""){
					data[0].conditions = JSON.parse(data[0].conditions.trim());
				}else{
					data[0].conditions = false;
				}
				if(data[0].actions){
					data[0].actions = JSON.parse(data[0].actions.trim());
				}else{
					data[0].actions = false;
				}
				callback(data[0]);
			}catch(e){
				helper.log.pure("Fehler im Json des Timers!");
				helper.log.pure(data[0]);
				helper.log.pure(e);
				return;
			};
		}
	});
}
var getTimers = function(callback){
	var query = "SELECT id, name, active, variables, conditions, actions, user, lastexec FROM timer;";
	db.all(query, function(err, data){
		if(err){
			callback(404);
			helper.log.error(err);
		}else{
			for(var i = 0; i< data.length; i++){
				try{
					if(data[i].variables != ""){
						data[i].variables = JSON.parse(data[i].variables.trim());
					}else{
						data[i].variables = false;
					}
					if(data[i].conditions != ""){
						data[i].conditions = JSON.parse(data[i].conditions.trim());
					}else{
						data[i].conditions = false;
					}
					if(data[i].actions){
						data[i].actions = JSON.parse(data[i].actions.trim());
					}else{
						data[i].actions = false;
					}
				}catch(e){
					helper.log.error("Fehler im JSON bei diesem Timer!");
					helper.log.pure(data[i]);
				}
			}
			callback(data);
		}
	});
}
var getUserTimers = function(user, callback){
	var query = "SELECT id, name, active, variables, conditions, actions, user, lastexec FROM timer WHERE user = '" + user + "';";
	db.all(query, function(err, data){
		if(err){
			callback(404);
			helper.log.error(err);
		}else{
			var timers = {};
			for(var i = 0; i< data.length; i++){
				try{
					if(data[i].variables != ""){
						data[i].variables = JSON.parse(data[i].variables.trim());
					}else{
						data[i].variables = false;
					}
					if(data[i].conditions != ""){
						data[i].conditions = JSON.parse(data[i].conditions.trim());
					}else{
						data[i].conditions = false;
					}
					if(data[i].actions){
						data[i].actions = JSON.parse(data[i].actions.trim());
					}else{
						data[i].actions = false;
					}
					timers[data[i].id] = data[i];
				}catch(e){
					helper.log.error("Fehler im JSON bei diesem Timer!");
					helper.log.pure(data[i]);
				}
			}
			callback(timers);
		}
	});
}
var checkVariables = function(timer, variable, switchToThis, switchtimer, callback){
	timer.variables[variable.id].forEach(function(variab){
		switch(variab.mode){
			case 'match':
				if(variab.status == variable.status.toString()){
					helper.log.pure('	Variable ' + variable.id + ' hat sich zu "' + variab.status + '" geändert!');
					switchtimer = true;
					switchToThis = 'on';
				}else{
					// helper.log.debug('Variable hat den falschen status');
				}
				break;
			case 'onChange':
				helper.log.pure('	Variable ' + variable.id + ' hat sich geändert');
				switchtimer = true;
				break;
			default:
				// helper.log.pure('error');
				break;
		}
	});
	callback(timer, switchToThis, switchtimer);
}

var switchActions = function(timer, status, switchtimer){
	if(timer.actions && switchtimer != false){
		helper.log.pure("	Aktionen ausführen:");
		if(timer.actions.device){
			helper.log.debug('		Geräte schalten!');
			timer.actions.devices.forEach(function(device){
				helper.log.debug(device.action.name);
				helper.switchaction('device', device.action.id, device.action.switchstatus, device.timeout);
			});
		}
		if(timer.actions.group){
			helper.log.debug('		Gruppe schalten!');
			timer.actions.groups.forEach(function(group){
				helper.switchaction('group', group.action.id, group.action.switchstatus, group.timeout);
			});
		}
		if(timer.actions.room){
			helper.log.debug('		Raum schalten!');
			timer.actions.rooms.forEach(function(room){
				helper.switchaction('room', room.action.id, room.action.switchstatus, room.timeout);
			});
		}
		if(timer.actions.saveSensors){
			helper.log.pure("		Speichere Sensoren");
			var url = 'http://' + conf.QuickSwitch.ip + ':' + conf.QuickSwitch.port + '/saveSensors';
			request(url, function (error, response, body) {
				if (error) {
					helper.log.pure(error);
				}
			});
		}
		if(timer.actions.alerts){
			timer.actions.alerts.forEach(function(alert){
				if(alert.activeTimeout){
					setTimeout(function(){
						helper.log.pure("		Erzeuge Alert: " + alert.action.name + "|" + alert.action.message);	
						var url = "http://" + conf.QuickSwitch.ip + ":" + conf.QuickSwitch.port + "/send/alert/" + alert.action.name + "/" + alert.action.message + "/" + alert.action.user + "/" + alert.action.type;
						helper.log.pure(url);
						request(url , function (error, response, body) {
							if (error) {
								helper.log.pure(error);
							}
						});
					}, parseInt(alert.timeout) * 1000);
				}else{
					helper.log.pure("		Erzeuge Alert: " + alert.action.name + "|" + alert.action.message);	
					var url = "http://" + conf.QuickSwitch.ip + ":" + conf.QuickSwitch.port + "/send/alert/" + alert.action.name + "/" + alert.action.message + "/" + alert.action.user + "/" + alert.action.type;
					helper.log.pure(url);
					request(url , function (error, response, body) {
						if (error) {
							helper.log.pure(error);
						}
					});
				}
			});
		}
		if(timer.actions.intervals){
			timer.actions.intervals.forEach(function(interval){
				var sched			=	later.parse.text('every ' + interval.number + ' ' + interval.unit);
				var id = parseInt(interval.id);
				if(allIntervals.intervals[interval.id] == undefined){
					helper.log.pure("		Setze ein Interval!");
					switch(interval.type){
						case "saveSensors":
							helper.log.pure("		Speichere Sensoren");
							var url = 'http://' + conf.QuickSwitch.ip + ':' + conf.QuickSwitch.port + '/saveSensors';
							allIntervals.setInterval(id, function(){
								request(url, function (error, response, body) {
									if (error) {
										helper.log.pure(error);
									}
								});
							}, sched);
							break;
						case "group":
						case "room":
							allIntervals.setInterval(id, function() { helper.switchaction(interval.type, interval.action.id, interval.action.switchstatus);} , sched);
							break;
						case "device":
							helper.log.pure("		Schalte Gerät");
							allIntervals.setInterval(id, function() { helper.switchaction(interval.type, interval.action.deviceid, interval.action.switchstatus);} , sched);
							break;
						case "storeVariable":
							helper.log.pure("		Speichere Variable: " + interval.action.name);
							allIntervals.setInterval(id, function() { variableFunctions.storeVariable(interval.action.name);} , sched);
							break;
						case "urls":
							helper.log.pure("		Rufe Url auf");
							interval.action.forEach(function(url){
								allIntervals.setInterval(id, function() {
									request(url, function (error, response, body) {
										if (error) {
											helper.log.pure(error);
										}
									});
								} , sched);
							});
							break;
						default:
							helper.log.info("Keine Aktion für das Intervall ausgewählt:" + interval.type);
							break;
					}
					helper.log.pure("		Neues Interval mit der id: " + id + " angelegt!\n");
				}else{
					helper.log.pure("		Intervall wurde schon gesetzt!\n");
				}
			});
		}
		if(timer.actions.pushbullets){
			timer.actions.pushbullets.forEach(function(pushbullet){
				if(action.activeTimeout){
					setInterval(function(){
						helper.log.pure("		Sende Pushbullet:" + pushbullet.action.name + "|" + pushbullet.action.message);
						var url = "http://" + conf.QuickSwitch.ip + ":" + conf.QuickSwitch.port + "/send/pushbullet:send/" + pushbullet.action.name + "/" + pushbullet.action.message + "/" + pushbullet.action.receiver;
						//helper.log.pure(url);
						request(url , function (error, response, body) {
							if (error) {
								helper.log.pure(error);
							}
						});
					}, parseInt(pushbullet.timeout) * 1000);
				}else{
					helper.log.pure("		Sende Pushbullet:" + pushbullet.action.name + "|" + pushbullet.action.message);
					var url = "http://" + conf.QuickSwitch.ip + ":" + conf.QuickSwitch.port + "/send/pushbullet:send/" + pushbullet.action.name + "/" + pushbullet.action.message + "/" + pushbullet.action.receiver;
					helper.log.pure(url);
					request(url , function (error, response, body) {
						if (error) {
							helper.log.pure(error);
						}
					});
				}
			});
		}
		if(timer.actions.storeVariables){
			timer.actions.storeVariables.forEach(function(variable){
				helper.log.pure("		Speichere Variable:" + variable.action.name);
				if(variable.activeTimeout){
					setTimeout(function(){
						variableFunctions.storeVariable(variable.action.name);
					}, parseInt(variable.timeout) * 1000);
				}else{
					variableFunctions.storeVariable(variable.action.name);
				}
			});
		}
		if(timer.actions.urls){
			timer.actions.urls.forEach(function(url){
				if(url.activeTimeout){
					setTimeout(function(){
						request(url.action.url , function (error, response, body) {
							if (error) {
								helper.log.pure(error);
							}
						});
					}, parseInt(url.timeout) * 1000);
				}else{
					request(url.action.url , function (error, response, body) {
						if (error) {
							helper.log.pure(error);
						}
					});
				}
			});
		}
		var query = "UPDATE `timer` SET `lastexec`='" + parseInt(new Date().getTime()) + "' WHERE `id` = " + timer.id + ";";
		db.run(query);
	}
}

/*
var compareVariables = function(condition, variable){
	switch(condition.condition){
		case"größer":
			if(variable.temp > condition.value){
				helper.log.pure("		Ergebnis: 	stimmt \n");
			}else{
				switchtimer = false;
				helper.log.pure("		Ergebnis: 	stimmt nicht \n");
			}
			break;
		case"kleiner":
			if(variable.temp < condition.value){
				helper.log.pure("		Ergebnis: 	stimmt \n");
			}else{
				switchtimer = false;
				helper.log.pure("		Ergebnis: 	stimmt nicht \n");
			}
			break;
		case"gleich":
			if(variable.temp === condition.value){
				helper.log.pure("		Ergebnis: 	stimmt \n");
			}else{
				switchtimer = false;
				helper.log.pure("		Ergebnis: 	stimmt nicht \n");
			}
			break;
		case"ungleich":
			if(variable.temp !== condition.value){
				helper.log.pure("		Ergebnis: 	stimmt \n");
			}else{
				switchtimer = false;
				helper.log.pure("		Ergebnis: 	stimmt nicht \n");
			}
			break;										
		case"größergleich":
			if(variable.temp >= condition.value){
				helper.log.pure("		Ergebnis: 	stimmt \n");
			}else{
				switchtimer = false;
				helper.log.pure("		Ergebnis: 	stimmt nicht \n");
			}
			break;
		case"kleinergleich":
			if(variable.temp <= condition.value){
				helper.log.pure("		Ergebnis: 	stimmt \n");
			}else{
				switchtimer = false;
				helper.log.pure("		Ergebnis: 	stimmt nicht \n");
			}
			break;
		default:
			break;
	}
}
*/
var checkTimer = function(variable){
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
	getTimers(function(timers){
		timers.forEach(function(timer){
			if(timer.active == "false"){
				return;
			}
			// helper.log.pure(timer.variables);
			if(variable && typeof timer.variables == "object"){
				if(timer.variables[variable.id]){
					helper.log.debug("Prüfe Timer mit Variablen: " + timer.name);
					checkVariables(timer, variable, undefined, false, function(timer, switchToThis, switchtimer){
						checkConditions(timer, switchToThis, switchtimer, function(timer, switchToThis, switchtimer){
							switchActions(timer, switchToThis, switchtimer);
						});
					});
				}
			}else if(typeof timer.variables != "object"){
				helper.log.debug("Prüfe Timer nur mit Bedingungen: " + timer.name);
				checkConditions(timer, undefined, true, function(timer, switchToThis, switchtimer){
					switchActions(timer, switchToThis, switchtimer);
				});
			}
		});
	});
}
module.exports = {
	getTimers: getTimers,
	getUserTimers: getUserTimers,
	getTimer: getTimer,
	saveTimer: function(data, callback){
		if(!data.lastexec){
			data.lastexec = new Date().getTime();
		}
		// helper.log.pure(data);
		if(data.id){
			var query = "UPDATE timer SET name = '" + data.name + "', variables = '" + JSON.stringify(data.variables) + "', conditions = '" + JSON.stringify(data.conditions) + "', actions = '" + JSON.stringify(data.actions) + "', lastexec = '" + data.lastexec + "' WHERE id = '" + data.id + "';";
			db.run(query);
			getTimer(data.id, function(data){
				callback( undefined, data);
			});
		}else{
			var query = "INSERT INTO timer (name, variables, conditions, actions, user, lastexec) VALUES ('" + data.name + "', '" + JSON.stringify(data.variables) + "', '" + JSON.stringify(data.conditions) + "', '" + JSON.stringify(data.actions) + "','" + data.user + "','" + data.lastexec + "');";
			// db.run(query);
			db.all(query, function(err, data){
				if(err){
					callback(err, undefined);
				}else{
					getTimer(data.insertId, function(data){
						callback( undefined, data);
					});
				}
			});
		}
	},
	// saveNewTimer: function(data, callback){
	// 	var query = "INSERT INTO timer (name, variables, conditions, actions, user) VALUES ('" + data.name + "', '" + JSON.stringify(data.variables) + "', '" + JSON.stringify(data.conditions) + "', '" + JSON.stringify(data.actions) + "','" + data.user + "');";
	// 	db.all(query, function(err, data){
	// 		if(err){
	// 			callback(err, undefined);
	// 		}else{
	// 			getTimer(data.insertId, function(data){
	// 				callback( undefined, data);
	// 			});
	// 		}
	// 	});
	// },
	// saveEditTimer: function(data, callback){
	// 	var query = "UPDATE timer SET name = '" + data.name + "', variables = '" + JSON.stringify(data.variables) + "', conditions = '" + JSON.stringify(data.conditions) + "', actions = '" + JSON.stringify(data.actions) + "' WHERE id = '" + data.id + "';";
	// 	db.run(query);
	// 	callback(undefined, data);
	// },
	deleteTimer: deleteTimer,
	switchTimer: function(data, callback){
		var query = "UPDATE timer SET active='" + data.active + "' WHERE id ='" + data.id + "';"
		db.run(query);
		callback(200);
	},
	checkTimer: checkTimer,
	switchActions: switchActions,
	deaktivateInterval: deaktivateInterval
}