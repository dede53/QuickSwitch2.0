var SunCalc						=	require('suncalc');
var conf						=	require('../../config.json');
var db							=	require('./database.js');
var later 						=	require('later');
var util						=	require("util");

var allIntervals				=	{
										setInterval: function(id, callback, sched){
											this.intervals[id] = later.setInterval(callback, sched);
										},
										clearInterval: function(id){
											this.intervals[id].clear();
											delete this.intervals[id];
										},
										intervals: {}
									};


var createTimer = function(timer, config){
	try{
		if(timer.variables != ""){
			timer.variables = JSON.parse(timer.variables.trim());
		}else{
			timer.variables = false;
		}
		if(timer.conditions != ""){
			timer.conditions = JSON.parse(timer.conditions.trim());
		}else{
			timer.conditions = false;
		}
		if(timer.actions){
			timer.actions = JSON.parse(timer.actions.trim());
		}else{
			timer.actions = false;
		}
	}catch(e){
		throw e;
	};
	this.log = {
		"info": function(data){
			if(config.loglevel == 1 ){
				process.send({"log":data});
			}
		},
		"debug": function(data){
			if(config.loglevel <= 2){
				process.send({"log":data});
			}
		},
		"warning": function(data){
			if(config.loglevel <= 3){
				process.send({"log":data});
			}
		},
		"error": function(data){
			if(config.loglevel <= 4){
				process.send({"log":data});
			}
		},
		"pure": function(data){
			process.send({"log":data});
		}
	}
	this.timer = timer;
}



createTimer.prototype.setLastExec = function(timestamp){
	var timestamp = parseInt(timestamp);
	var query = "UPDATE `timer` SET `lastexec`= " + timestamp + " WHERE `id` = " + this.timer.id + ";";
	db.run(query);
	this.timer.lastexec = timestamp;
}

createTimer.prototype.deaktivateInterval = function(){
	if(this.timer.actions.intervals){
		this.timer.actions.intervals.forEach(function(interval){
			this.log.debug("Interval mit der ID:" + interval.id + " deaktiviert");
			allIntervals.intervals[interval.id].clear();
			delete allIntervals.intervals[interval.id];
		});
	}
};

createTimer.prototype.saveTimer = function(data, callback){
	if(!data.lastexec){
		data.lastexec = new Date().getTime();
	}
	this.timer = data;
	// this.log.info(data);
	if(data.id){
		var query = "UPDATE timer SET name = '" + data.name + "', variables = '" + JSON.stringify(data.variables) + "', conditions = '" + JSON.stringify(data.conditions) + "', actions = '" + JSON.stringify(data.actions) + "', lastexec = '" + data.lastexec + "' WHERE id = '" + data.id + "';";
		db.run(query);
		callback( undefined, this.timer);
	}else{
		var query = "INSERT INTO timer (name, variables, conditions, actions, user, lastexec) VALUES ('" + data.name + "', '" + JSON.stringify(data.variables) + "', '" + JSON.stringify(data.conditions) + "', '" + JSON.stringify(data.actions) + "','" + data.user + "','" + data.lastexec + "');";
		// db.run(query);
		db.all(query, function(err, data){
			if(err){
				callback(err, undefined);
			}else{
				this.timer.id = data.insertId; 
				getTimer(data.insertId, function(data){
					this.log.info(data);
					callback( undefined, data);
				});
			}
		});
	}
};

createTimer.prototype.deleteTimer = function(callback){
	createTimer.prototype.deaktivateInterval();
	clearInterval(this.interval);
	var query = "DELETE FROM timer WHERE id = '" + this.timer.id + "';";
	db.all(query, function(err, data){
		callback(err, data);
	});
};


createTimer.prototype.switchActions = function(timer, status, switchtimer){
	if(timer.actions && switchtimer != false){
		this.log.info("	Aktionen ausführen:");
		if(timer.actions.devices){
			this.log.debug('		Geräte schalten!');
			timer.actions.devices.forEach(function(device){
				if(device.timeout){
					setTimeout(function(){
						process.send({'device':device});
					}, device.timeout * 1000);
				}else{
					process.send({'device':device});
				}
			});
		}
		if(timer.actions.groups){
			this.log.debug('		Gruppe schalten!');
			timer.actions.groups.forEach(function(group){
				if(group.timeout){
					setTimeout(function(){
						process.send({'group':group});
					}, group.timeout * 1000);
				}else{
					process.send({'group':group});
				}
			});
		}
		if(timer.actions.rooms){
			this.log.debug('		Raum schalten!');
			timer.actions.rooms.forEach(function(room){
				if(room.timeout){
					setTimeout(function(){
						process.send({'room':room});
					}, room.timeout * 1000);
				}else{
					process.send({'room':room});
				}
			});
		}
		if(timer.actions.saveSensors){
			this.log.info("		Speichere Sensoren");
			process.send({
				"saveSensors": timer.actions.saveSensors
			});
		}
		if(timer.actions.alerts){
			var that = this;
			timer.actions.alerts.forEach(function(alert){
				if(alert.activeTimeout){
					setTimeout(function(){
						that.log.info("		Erzeuge Alert: " + alert.action.title + "|" + alert.action.message);
						process.send({"alert": alert});
					}, parseInt(alert.timeout) * 1000);
				}else{
					that.log.info("		Erzeuge Alert: " + alert.action.title + "|" + alert.action.message);
					process.send({"alert": alert});
				}
			});
		}
		if(timer.actions.intervals){
			var that = this;
			for(var key in timer.actions.intervals){
				var intervals = timer.actions.intervals[key];
				intervals.forEach(function(interval){
					var sched			=	later.parse.text('every ' + interval.number + ' ' + interval.unit);
					var id = parseInt(interval.id);
					if(allIntervals.intervals[id] == undefined){
						allIntervals.setInterval(id, function(){
							var data = {};
							data[interval.type] = interval;
							process.send(data);
						}, sched);
						that.log.debug("	Neues Interval mit der id: " + id + " angelegt!");
					}else{
						that.log.debug("	Intervall wurde schon gesetzt:" + id);
					}
				});
			}
		}
		if(timer.actions.pushbullets){
			timer.actions.pushbullets.forEach(function(pushbullet){
				if(action.activeTimeout){
					setInterval(function(){
						this.log.info("		Sende Pushbullet:" + pushbullet.action.name + "|" + pushbullet.action.message);
						process.send({"pushbullet": pushbullet.action});
					}, parseInt(pushbullet.timeout) * 1000);
				}else{
					this.log.info("		Sende Pushbullet:" + pushbullet.action.name + "|" + pushbullet.action.message);
					process.send({"pushbullet": pushbullet.action});
				}
			});
		}
		if(timer.actions.storeVariables){
			timer.actions.storeVariables.forEach(function(variable){
				this.log.info("		Speichere Variable:" + variable.action);
				if(variable.activeTimeout){
					setTimeout(function(){
						variableFunctions.storeVariable(variable.action);
					}, parseInt(variable.timeout) * 1000);
				}else{
					variableFunctions.storeVariable(variable.action);
				}
			});
		}
		if(timer.actions.urls){
			timer.actions.urls.forEach(function(url){
				if(url.activeTimeout){
					setTimeout(function(){
						process.send({"url": url});
					}, parseInt(url.timeout) * 1000);
				}else{
					process.send({"url": url});
				}
			});
		}
/*		if(timer.actions.intervals){
			var that = this;
			for(var key in timer.actions.intervals){
				var intervals = timer.actions.intervals[key];
				intervals.forEach(function(interval){
					var sched			=	later.parse.text('every ' + interval.number + ' ' + interval.unit);
					var id = parseInt(interval.id);
					if(allIntervals.intervals[id] == undefined){
						allIntervals.setInterval(id, function(){
							var data = {};
							data[interval.type] = interval;
							process.send(data);
						}, sched);
						that.log.debug("	Neues Interval mit der id: " + id + " angelegt!");
					}else{
						that.log.debug("	Intervall wurde schon gesetzt:" + id);
					}
				});
			}
		}else{
			timer.actions.urls.forEach(function(url){
				if(url.activeTimeout){
					setTimeout(function(){
						process.send({"url": url});
					}, parseInt(url.timeout) * 1000);
				}else{
					process.send({"url": url});
				}
			});
		}*/
		this.setLastExec(new Date().getTime());
	}
}

createTimer.prototype.checkTimer = function(variable){
	var that = this;
	var getRandomInt = function(min, max) {
		return Math.floor(Math.random() * (max - min)) + min;
	}

	var parseTime = function(time){
		var time 		= time.split(':');
		return createTime(new Date().setHours(time[0], time[1]));
	}
	var isTimeInRange = function(lower, upper) {
		var now = new Date();
		var inRange = false;
		if (upper > lower) {
			// opens and closes in same day
			inRange = (now >= lower && now <= upper) ? true : false;
		} else {
			// closes in the following day
			inRange = (now >= upper && now <= lower) ? false : true;
		}
		return inRange;
	}
	var createTime = function(time){
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

	var getSuntime = function (type, offset){
		var suntimes			= SunCalc.getTimes(new Date(), conf.location.lat, conf.location.long);
		if(type == "sunrise"){
			var suntime 		= new Date(suntimes.sunrise);
			that.log.info("	Sonnenaufgang:	" + suntime.getHours() + ':' + suntime.getMinutes());
		}else{
			var suntime 		= new Date(suntimes.sunset);
			that.log.info("	Sonnenuntergang:	" + suntime.getHours() + ':' + suntime.getMinutes());
		}

		if(offset && offset.number != ""){
			if(offset.unit == "+"){
				that.log.info("	Offset: 		" + offset.number + " Minuten später");
				var suntime = new Date(suntime.getTime() + (offset.number * 60000));
			}else{
				that.log.info("	Offset: 		" + offset.number + " Minuten früher");
				var suntime = new Date(suntime.getTime() - (offset.number * 60000));
			}
		}
		return createTime(suntime.getTime());
	}
	var calculateOffset = function(timer, condition){
		var suntimes			= SunCalc.getTimes(new Date(), conf.location.lat, conf.location.long);
		// Wenn noch nie ausgeführt dann letzte Ausführung auf vor 12 Stunden setzten
		timer.lastexec = parseInt(timer.lastexec);
		if(!timer.lastexec){
			timer.lastexec = new Date().getTime() - 12 * 60 * 60000;
		}

		// Uhrzeit aus Sunset/Sunrise/Standard errechenen 
		switch(condition.time){
			case "sunrise":
				var time 		= new Date(suntimes.sunrise);
				var hours 		= time.getHours();
				var minutes 	= time.getMinutes();
				that.log.info("	Sonnenaufgang:	" + hours + ':' + minutes);
				break;
			case "sunset":
				var time 		= new Date(suntimes.sunset);
				var hours 		= time.getHours();
				var minutes 	= time.getMinutes();
				that.log.info("	Sonnenuntergang:	" + hours + ':' + minutes);
				break;
			default:
				var time 		= condition.time.split(':');
				var hours 		= time[0];
				var minutes 	= time[1];
				time = new Date();
				time.setHours(hours, minutes);
				time = parseInt(time.getTime());
				that.log.info("	Zeit:	" + hours + ':' + minutes);
				break;
		}

		
		if(condition.offset){
			var offset = condition.offset;
		}else{
			var offset = {
				number:0,
				unit:true
			}
		}

		var timeMin = time - (offset.numberMax * 60000);
		var timeMax = time + (offset.numberMax * 60000);
		if(timer.lastexec > timeMin && timer.lastexec < timeMax){
			that.log.info("	Timer schon ausgeführt");
			return false;
		}

		// Offset verschiebung errechenen (früher/später)
		switch(offset.unit){
			case '+':
			case 'true':
			case true:
				var newUnit = true;
				break;
			case '-':
			case 'false':
			case false:
				var newUnit = false;
				break;
			case 'random':
				var newUnit = getRandomBoolean();
				if(new Date().getTime() > time){
					var newUnit = true;
				}
				break;
			default:
				var newUnit = true;
				break;
		}

		if(offset.mode == 'random'){
			//that.log.info('RANDOM:' + offset);
			if(new Date().getTime() < timeMax && new Date().getTime() > timeMin){
				if(newUnit == true){
					// Später
					var newOffsetNumber = Math.abs(Math.round((new Date().getTime() - time) / 60000));
					that.log.info(newOffsetNumber);
					if(newOffsetNumber > offset.numberMin){
						offset.numberMin = newOffsetNumber;
					}
				}else{
					// Früher
					var newOffsetNumber = Math.abs(Math.round((time - new Date().getTime()) / 60000));
					if(newOffsetNumber < offset.numberMax){
						offset.numberMax = newOffsetNumber;
					}
				}
			}else{
				that.log.info('	Zeit mit diesem Interval nicht erfüllbar!');
				return false;
			}
			// Zufällige Zeiten berechnen:
			that.log.info("		Interval: 		" + offset.numberMin  + "-" + offset.numberMax);
			offset.number = getRandomInt(parseInt(offset.numberMin), parseInt(offset.numberMax));
		}else{
			if(timer.lastexec > new Date().getTime() - 60000){
				that.log.info("	Timer schon ausgeführt");
				return false;
			}
		}


		if(offset && offset.number != ""){
			if(newUnit == true){
				that.log.info("	Offset: 		" + offset.number + " Minuten später");
				var newTime = new Date(time + (offset.number * 60000));
			}else{
				that.log.info("	Offset: 		" + offset.number + " Minuten früher");
				var newTime = new Date(time - (offset.number * 60000));
			}
			var hours 		= newTime.getHours();
			var minutes 	= newTime.getMinutes();
		}

		minutes = ("0" + minutes).slice(-2);
		hours = ("0" + hours).slice(-2);

		var now = hours + ':' + minutes;
		that.log.info("	Errechnete Zeit: 	" + now);
		return now;
	}
	var checkVariables = function(timer, variable, switchToThis, switchtimer, callback){
		if(!variable){
			callback(timer, switchToThis, switchtimer);
		}else if(timer.variables[variable.id]){
			timer.variables[variable.id].forEach(function(variab){
				switch(variab.mode){
					case 'match':
						if(variab.status == variable.status.toString()){
							that.log.info('	Variable ' + variable.id + ' hat sich zu "' + variab.status + '" geändert!');
							switchtimer = true;
							switchToThis = 'on';
						}else{
							that.log.info('	Variable hat den falschen status');
							switchtimer = false;
						}
						break;
					case 'onChange':
						that.log.info('	Variable ' + variable.id + ' hat sich geändert');
						switchtimer = true;
						break;
					default:
						// that.log.info('error');
						break;
				}
			});
			callback(timer, switchToThis, switchtimer);
		}
	}

	var checkConditions = function(allVariables, that, timer, switchToThis, switchtimer, callback){
		if(switchtimer == false || switchtimer == "false"){
			return;
		}
		if(!timer.conditions){
			that.log.info("	Keine Bedingungen für diesen Timer");
			that.log.info("		Ergebnis: 	stimmt");
			callback(timer, switchToThis, true);
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
			that.log.info("	Prüfe Zeitraum...");
			timer.conditions.range.forEach(function(condition){
				that.log.info("		" + condition.start + " - " + condition.stop);
				var startTime = parseTime(condition.start);
				var stopTime = parseTime(condition.stop);
				
				if(isTimeInRange(startTime.timestamp, stopTime.timestamp)){
					switchNow = true;
					that.log.info("		Ergebnis: 	stimmt");
				}else{
					that.log.info("		Ergebnis: 	stimmt nicht");
					switchtimer = false;
				}
			});
		}

		if(timer.conditions.time){
			var now = createTime(new Date().getTime());


			that.log.info("Prüfe Zeit...");

			timer.conditions.time.forEach(function(condition){
				switch(condition.time){
					case "sunset":
						var newTime = getSuntime("sunset", condition.offset);
						that.log.info("	Schaltzeit: 	" + newTime.time);
						if(newTime.time == now.time){
							if(timer.lastexec < newTime.timestamp){
								that.log.info("	Ergebnis: 	stimmt");
								switchNow = true;
								switchToThis = condition.action;
							}else{
								that.log.info('	Timer wurde schon geschaltet');
								switchtimer = false;
							}
						}else{
							that.log.info("	Ergebnis: 	stimmt nicht");
							switchtimer = false;
						}
						break;
					case "sunrise":
						var newTime = getSuntime("sunrise", condition.offset);
						that.log.info("	Schaltzeit: 	" + newTime.time);
						if(newTime.time == now.time){
							if(timer.lastexec < newTime.timestamp){
								that.log.info("	Ergebnis: 	stimmt");
								switchNow = true;
								switchToThis = condition.action;
							}else{
								that.log.info('	Timer wurde schon geschaltet');
								switchtimer = false;
							}
						}else{
							that.log.info("	Ergebnis: 	stimmt nicht");
							switchtimer = false;
						}
						break;
					default:
						if(typeof condition.time == "string"){
							condition.time = parseTime(condition.time);
						}
						that.log.info("	Schaltzeit:	" + condition.time.time);
						if(condition.time.time == now.time){
							if(timer.lastexec < condition.time.timestamp){
								that.log.info("	Ergebnis: 	stimmt");
								switchNow = true;
								switchToThis = condition.action;
							}else{
								that.log.info('	Timer wurde schon geschaltet');
								switchtimer = false;
							}
						}else{
							that.log.info("	Ergebnis: 	stimmt nicht");
							switchtimer = false;
						}
						break;
				}
			});
		}
		if(timer.conditions.random){
			that.log.info("Prüfe Zufallszeit...");

			timer.conditions.random.forEach(function(condition){
				var now = createTime(new Date().getTime());
				var startTime = parseTime(condition.start);
				var stopTime = parseTime(condition.stop);

				// Zeitraum prüfen
				if(startTime.timestamp <= now.timestamp && stopTime.timestamp >= now.timestamp){
					if(that.timer.lastexec > startTime.timestamp && that.timer.lastexec < stopTime.timestamp){
						// schon ausgeführt!
						that.log.info("	Timer schon ausgeführt");
						that.log.info("	Ergebnis: 	stimmt nicht");
						switchtimer = false;
					}else{
						// Noch nicht ausgeführt!
						if(!this.calculatedTime){
							// Timestamp zum Schalten generieren
							var minutes = getRandomInt(now.timestamp, stopTime.timestamp);
							// this.log.info(new Date(minutes));
							this.calculatedTime = createTime(minutes);
							that.log.info('	Neue Schaltzeit berechnet!');
						}
						that.log.info('	Schaltzeit:' + new Date(this.calculatedTime.timestamp));
						if(this.calculatedTime.time == now.time){
							// Schalten!!
							that.log.info('	Jetzt schalten!');
							this.calculatedTime = false;
							that.log.info("		Ergebnis: 	stimmt");
							switchNow = true;
							switchToThis = condition.action;
						}else{
							that.log.info('	Ergebnis: 	stimmt nicht');
							switchtimer = false;
						}
					}
				}else{
					that.log.info("	Uhrzeit nicht zwischen " + startTime.time + " und " + stopTime.time);
					that.log.info("	Ergebnis: 	stimmt nicht");
					switchtimer = false;
				}
			});
		}
		/*
			[
				{
					"id":"id",
					"compare":"gleich|größer|gleiner|ungleich|.."
				},
				{
					"id":"id",
					"compare":"gleich|größer|gleiner|ungleich|.."
					"value":23
				}
			]
		*/

		if(timer.conditions.variable){
			var status = false;
			for(var i in timer.conditions.variable){
				var variable = timer.conditions.variable[i];
				switch(variable.compare){
					case "größer":
						if(parseInt(allVariables[variable.id].status) > parseInt(variable.value)){
							if(that.timer.lastexec > allVariables[variable.id].lastChange){
								that.log.info("		Ergebnis: stimmt nicht: 	schon ausgeführt");
							}else{
								that.log.info("		Ergebnis: stimmt: 	" + allVariables[variable.id].status + '>' + variable.value);
								switchNow = true;
							}
						}else{
							that.log.info("		Ergebnis: stimmt nicht: 	" + allVariables[variable.id].status + '<=' + variable.value);
							switchtimer = false;
						}
						break;
					case "kleiner":
						if(allVariables[variable.id].status < parseInt(variable.value)){
							if(that.timer.lastexec > allVariables[variable.id].lastChange){
								that.log.info("		Ergebnis: stimmt nicht: 	schon ausgeführt");
							}else{
								that.log.info("		Ergebnis: stimmt: 	" + allVariables[variable.id].status + '<' + variable.value);
								switchNow = true;
							}
						}else{
							that.log.info("		Ergebnis stimmt nicht: 	" + allVariables[variable.id].status + '>=' + variable.value);
							switchtimer = false;
						}
						break;
					case "ungleich":
						if(variable.value != allVariables[variable.id].status){
							if(that.timer.lastexec < new Date().getTime() - 5 * 100){
								that.log.info("		Ergebnis: stimmt: 	" + variable.value + '!=' + allVariables[variable.id].status);
								switchNow = true;
							}
						}else{
							that.log.info("		Ergebnis: stimmt nicht: 	" + variable.value + '=' + allVariables[variable.id].status);
							switchtimer = false;
						}
						break;
					case "gleich":
						if(variable.value == allVariables[variable.id].status){
							if(that.timer.lastexec < new Date().getTime() - 5 * 100){
								that.log.info("		Ergebnis: stimmt: 	" + variable.value + '=' + allVariables[variable.id].status);
								switchNow = true;
							}
						}else{
							that.log.info("		Ergebnis: stimmt nicht: 	" + variable.value + '!=' + allVariables[variable.id].status);
							switchtimer = false;
						}
						break;
					default:
						break;
				}
			// });
			}
		}
		if(switchNow == true){
			switchtimer = true;
		}

		if(timer.conditions.weekdays){
			var datum = new Date();
			var tag = datum.getDay();

			that.log.info("	Prüfe Wochentag...");
			timer.conditions.weekdays.forEach(function(condition){
				if(condition[tag] == 1){					
					// switchNow = true;
					that.log.info("	Ergebnis: 	stimmt");
				}else{
					that.log.info("	Ergebnis: 	stimmt nicht");
					switchtimer = false;
				}
			});
		}
		callback(timer, switchToThis, switchtimer);
	}

	var compareVariables = function(condition, variable){
		switch(condition.condition){
			case"größer":
				if(variable.temp > condition.value){
					this.log.info("		Ergebnis: 	stimmt");
				}else{
					switchtimer = false;
					this.log.info("		Ergebnis: 	stimmt nicht");
				}
				break;
			case"kleiner":
				if(variable.temp < condition.value){
					this.log.info("		Ergebnis: 	stimmt");
				}else{
					switchtimer = false;
	
					this.log.info("		Ergebnis: 	stimmt nicht");
				}
				break;
			case"gleich":
				if(variable.temp === condition.value){
					this.log.info("		Ergebnis: 	stimmt");
				}else{
					switchtimer = false;
					this.log.info("		Ergebnis: 	stimmt nicht");
				}
				break;
			case"ungleich":
				if(variable.temp !== condition.value){
					this.log.info("		Ergebnis: 	stimmt");
				}else{
					switchtimer = false;
					this.log.info("		Ergebnis: 	stimmt nicht");
				}
				break;										
			case"größergleich":
				if(variable.temp >= condition.value){
					this.log.info("		Ergebnis: 	stimmt");
				}else{
					switchtimer = false;
					this.log.info("		Ergebnis: 	stimmt nicht");
				}
				break;
			case"kleinergleich":
				if(variable.temp <= condition.value){
					this.log.info("		Ergebnis: 	stimmt");
				}else{
					switchtimer = false;
					this.log.info("		Ergebnis: 	stimmt nicht");
				}
				break;
			default:
				break;
		}
	}

	
	var that = this;
	var query = "SELECT * FROM variable;";
	db.all(query, function(err, variables){
		if(err){
			that.log.error(err);
		}
		allVariables = {};
		variables.forEach(function(variable){
			allVariables[variable.id] = variable;
		});
		if(that.timer.active == true || that.timer.active == 'true'){
			that.log.info(that.timer.name);
			checkVariables(that.timer, variable, undefined, true, function(timer, switchToThis, switchtimer){
				checkConditions(allVariables, that, timer, switchToThis, switchtimer, function(timer, switchToThis, switchtimer){
					that.switchActions(timer, switchToThis, switchtimer);
				});
			});
		}
	});
}

createTimer.prototype.setActive = function(status, callback){
	if(status == true || status == 'true'){
		status = true;
		var that = this;
		this.timer.active = true;
		this.interval = setInterval(function(){
			that.checkTimer();
		}, 10 * 1000);
	}else{
		status = false;
		this.timer.active = false;
		this.deaktivateInterval();
		clearInterval(this.interval);
	}
	var query = "UPDATE timer SET active='" + status + "' WHERE id ='" + this.timer.id + "';"
	db.run(query);
	if(callback){
		callback();
	}
};

createTimer.prototype.getUserTimers = function(user, callback){
	var query = "SELECT id, name, active, variables, conditions, actions, user, lastexec FROM timer WHERE user = '" + user + "';";
	db.all(query, function(err, data){
		if(err){
			callback(404);
			this.log.error(err);
		}else{
			var timers = {};
			for(var i = 0; i< data.length; i++){
				timers[data[i].id] = new createTimer(data[i]);
			}
			callback(timers);
		}
	});
}

module.exports = createTimer;