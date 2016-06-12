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
var onewire					= require('./onewire.js');
var helper					= require('./helper.js');
var variableFunctions		= require('./variable.js');
var fs						= require('fs');
var async					= require("async");
var gpio					= require('rpi-gpio');
var request					= require('request');
var later 					= require('later');
var intervals				= {};
function isObjectEmpty(value){
    return Boolean(value && typeof value == 'object') && !Object.keys(value).length;
}
var checkConditions = function(timer, switchToThis, switchtimer, callback){
		// helper.log.debug(timer.conditions);
		if(switchtimer == false || switchtimer == "false"){
			return;
		}
		if(!timer.conditions){
			callback(timer, switchToThis, switchtimer);
		}

		if(timer.conditions.range){
			timer.conditions.range.forEach(function(condition){					
				if(helper.isTimeInRange(condition.start.time, condition.stop.time)){
					console.log("	Ergebnis: 	stimmt \n");
					switchtimer = true;
				}else{
					console.log("	Ergebnis: 	stimmt nicht \n");
				}
			});
		}

		if(timer.conditions.weekdays){

			var datum = new Date();
			var tag = datum.getDay();

			console.log("	Prüfe Wochentag...");
			if(timer.conditions.weekdays[tag] == 1){
				console.log("		Ergebnis: 	stimmt \n");
				switchtimer = true;
			} else{
				console.log("		Ergebnis: 	stimmt nicht \n");
			}
		}

		if(timer.conditions.time){
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

			console.log("Prüfe Zeit...");

			timer.conditions.time.forEach(function(condition){
				switch(condition.time){
					case "sunset":
						console.log("	Sonnenuntergang:");
						var newTime = helper.getSuntime("sunset", condition.offset);
						console.log("		Schaltzeit: 	" + newTime);
						if(newTime == now){
							console.log("		Ergebnis: 	stimmt \n");
							switchToThis = condition.action;
						}else{
							console.log("		Ergebnis: 	stimmt nicht \n");
							switchtimer = false;
						}
						break;
					case "sunrise":
						console.log("	Sonnenaufgang:");
						var newTime = helper.getSuntime("sunrise", condition.offset);
						console.log("		Schaltzeit: 	" + newTime);
						if(newTime == now){
							console.log("		Ergebnis: 	stimmt \n");
							switchToThis = condition.action;
						}else{
							console.log("		Ergebnis: 	stimmt nicht \n");
							switchtimer = false;
						}
						break;
					default:
						console.log("	Startzeit..." + condition.time);
						if(condition.time == now){
							console.log("		Ergebnis: 	stimmt \n");
							switchToThis = condition.action;
						}else{
							console.log("		Ergebnis: 	stimmt nicht \n");
							switchtimer = false;
						}
						break;
				}
			});
		}

		if(timer.conditions.variables){
			timer.conditions.variables.forEach(function(varToCheck){
				variableFunctions.getVariableByName(varToCheck.name, function(fullVariable){
					compareVariables(varToCheck, fullVariable);
				});
			});
		}

		callback(timer, switchToThis, switchtimer);
}
var getTimers = function(req, res, callback){
	var query = "SELECT id, name, active, variables, conditions, actions, user FROM timer;";
	db.all(query, function(err, data){
		if(err){
			callback(404);
			helper.log.error(err);
		}else{
			for(var i = 0; i< data.length; i++){
				try{
					if(data[i].variables != ""){
						data[i].variables = JSON.parse(data[i].variables.trim());
					}
					if(data[i].conditions != ""){
						data[i].conditions = JSON.parse(data[i].conditions.trim());
					}
					if(data[i].actions){
						data[i].actions = JSON.parse(data[i].actions.trim());
					}
				}catch(e){
					helper.log.error("Fehler im JSON bei diesem Timer!");
					console.log(data[i]);
				}
			}
			callback(data);
		}
	});
}
var checkVariables = function(timer, variable, switchToThis, switchtimer, callback){
	timer.variables[variable.name].forEach(function(variab){
		switch(variab.mode){
			case 'match':
				if(variab.status == variable.status.toString()){
					helper.log.debug('Variable ' + variab.name + ' hat sich zu "' + variab.status + '" geändert!');
					switchtimer = true;
					switchToThis = 'on';
				}else{
					// helper.log.debug('Variable hat den falschen status');
				}
				break;
			case 'onChange':
				helper.log.debug('Variable ' + variable.name + ' hat sich geändert');
				switchtimer = true;
				break;
			default:
				// console.log('error');
				break;
		}
	});
	callback(timer, switchToThis, switchtimer);
}

var switchActions = function(timer, status, switchtimer){
	if(timer.actions && switchtimer != false){
		if(timer.actions.devices){
			helper.log.debug('Geräte schalten!');
			timer.actions.devices.forEach(function(device){
				helper.switchaction('device', device.id, status);
			});
		}
		if(timer.actions.groups){
			helper.log.debug('Gruppe schalten!');
			timer.actions.groups.forEach(function(group){
				helper.switchaction('group', group.id, status);
			});
		}
		if(timer.actions.rooms){
			helper.log.debug('Raum schalten!');
			timer.actions.rooms.forEach(function(room){
				helper.switchaction('room', room.id, status);
			});
		}
		if(timer.actions.saveSensors){
			onewire.saveSensors();
		}
		if(timer.actions.alerts){
			timer.actions.alerts.forEach(function(alert){	
				var url = "http://" + conf.QuickSwitch.ip + ":" + conf.QuickSwitch.port + "/send/alert/" + alert.name + "/" + alert.message + "/" + alert.type;
				// console.log(url);
				request(url , function (error, response, body) {
					if (error) {
						console.log(error);
					}
				});
			});
		}
		// console.log(timer.actions);
		if(timer.actions.intervals){
			timer.actions.intervals.forEach(function(interval){
				var sched			=	later.parse.text('every ' + interval.number + ' ' + interval.unit);
				var id = interval.id;
				if(intervals[id] == undefined){
					console.log("	Setze ein Interval!");
					switch(interval.action){
						case "saveSensors":
							intervals[id] = later.setInterval(onewire.saveSensors , sched);
							break;
						case "device":
						case "group":
						case "room":
							intervals[id] = later.setInterval(function() { helper.switchaction(interval.action, interval.actionid, "on");} , sched);
							break;
						case "storeVariable":
							intervals[id] = later.setInterval(function() { variableFunctions.storeVariable(interval.name);} , sched);
							break;
						default:
							break;
					}
					console.log("	Neues Interval mit der id: " + id + " angelegt!\n");
				}else{
					// console.log("	Interval wurde schon gesetzt!\n");
				}
			});
		}
		if(timer.actions.pushbullets){
			timer.actions.pushbullets.forEach(function(action){
				var url = "http://" + conf.QuickSwitch.ip + ":" + conf.QuickSwitch.port + "/send/pushbullet/" + action.name + "/" + action.message + "/" + action.receiver;
				//console.log(url);
				request(url , function (error, response, body) {
					if (error) {
						console.log(error);
					}
				});
			});
		}
		if(timer.actions.storeVariables){
			timer.actions.storeVariables.forEach(function(variable){
				variableFunctions.storeVariable(variable.name);
			});
		}
	}
}

var compareVariables = function(condition, variable){
	switch(condition.condition){
		case"größer":
			if(variable.temp > condition.value){
				console.log("		Ergebnis: 	stimmt \n");
				switchtimer = true;
			}else{
				console.log("		Ergebnis: 	stimmt nicht \n");
			}
			break;
		case"kleiner":
			if(variable.temp < condition.value){
				console.log("		Ergebnis: 	stimmt \n");
				switchtimer = true;
			}else{
				console.log("		Ergebnis: 	stimmt nicht \n");
			}
			break;
		case"gleich":
			if(variable.temp === condition.value){
				console.log("		Ergebnis: 	stimmt \n");
				switchtimer = true;
			}else{
				console.log("		Ergebnis: 	stimmt nicht \n");
			}
			break;
		case"ungleich":
			if(variable.temp !== condition.value){
				console.log("		Ergebnis: 	stimmt \n");
				switchtimer = true;
			}else{
				console.log("		Ergebnis: 	stimmt nicht \n");
			}
			break;										
		case"größergleich":
			if(variable.temp >= condition.value){
				console.log("		Ergebnis: 	stimmt \n");
				switchtimer = true;
			}else{
				console.log("		Ergebnis: 	stimmt nicht \n");
			}
			break;
		case"kleinergleich":
			if(variable.temp <= condition.value){
				console.log("		Ergebnis: 	stimmt \n");
				switchtimer = true;
			}else{
				console.log("		Ergebnis: 	stimmt nicht \n");
			}
			break;
		default:
			break;
	}
}

var checkTimer = function(variable){

	getTimers(false, false, function(timers){
		// helper.log.debug("Checke Timer");
		timers.forEach(function(timer){

			if(timer.active == "false"){
				return;
			}
			if(variable){
				if(typeof timer.variables == "object"){
					if(timer.variables[variable.name]){
						// console.log("CheckTimer: Richtige Variable!");
						// console.log(timer.name);
						checkVariables(timer, variable, undefined, false, function(timer, switchToThis, switchtimer){
							checkConditions(timer, switchToThis, switchtimer, function(timer, switchToThis, switchtimer){
								switchActions(timer, switchToThis, switchtimer);
							});
						});
					}
				}
			}else{
				if(typeof timer.variables != "object"){
					// console.log("CheckTimer: Nur Bedingungen");
					checkConditions(timer, undefined, true, function(timer, switchToThis, switchtimer){
						switchActions(timer, switchToThis, switchtimer);
					});
				}
			}
		});
	});
}
module.exports = {
	getTimers: getTimers,
	getTimer: function(id, callback){
		var query = "SELECT id, name, active, variables, conditions, actions, user FROM timer WHERE id = " + id + ";";
		db.all(query, function(err, data){
			if(err){
				helper.log.error(err);
			}else if(data == ""){
				helper.log.error("Keinen Timer mit der ID: " + id);
			}else{
				try{
					if(data[0].variables != ""){
						data[0].variables = JSON.parse(data[0].variables.trim());
					}
					if(data[0].conditions != ""){
						data[0].conditions = JSON.parse(data[0].conditions.trim());
					}
					if(data[0].actions){
						data[0].actions = JSON.parse(data[0].actions.trim());
					}
					callback(data[0]);
				}catch(e){
					console.log("Fehler im Json des Timers!");
					console.log(data[0]);
					return;
				};
			}
		});
	},
	saveNewTimer: function(data, req, res, callback){
		var query = "INSERT INTO timer (name, variables, conditions, actions) VALUES ('" + data.name + "', '" + data.variables + "' '" + data.conditions + "', '" + data.actions + "');";
		db.run(query);
		callback(201);
	},
	saveEditTimer: function(data, req ,res, callback){
		var query = "UPDATE timer SET name = '" + data.name + "', variables = '" + data.variables + "', conditions = '" + data.conditions + "', actions = '" + data.actions + "' WHERE id = '" + data.id + "';";
		db.run(query);
		callback(201);
	},
	deleteTimer: function(id, callback){
		var query = "DELETE FROM timer WHERE id = '" + id + "';";
		db.all(query, function(err, data){
			if(err){
				callback(err);
			}else{
				callback("200");
			}
		});
	},
	switchTimer: function(data, callback){
		var query = "UPDATE timer SET active='" + data.active + "' WHERE id ='" + data.id + "';"
		db.run(query);
		callback(200);
	},
	checkTimer: checkTimer
}
/*
checkTimer({'name':'Daniel-Home', 'status': true});
checkTimer();
*/