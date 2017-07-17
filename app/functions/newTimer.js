var SunCalc						=	require('suncalc');
var conf						=	require('../../config.json');
var db							=	require('./database.js');
var later 						=	require('later');
var util						=	require("util");


var allIntervals				=	{
										setMyInterval: function(id, callback, sched){
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
		timer.actions.forEach(function(action){

			var data = {};
			data[action.type] = action;

			if(action.activeInterval){
				var id = parseInt(action.id);
				if(allIntervals.intervals[id] == undefined){
					var sched			=	later.parse.text('every ' + action.number + ' ' + action.unit);
					var that = this;
					allIntervals.setMyInterval(id, function(){
						if(action.activeTimeout){
							setTimeout(function(){
								that.log.debug("Aktion ausführen:" + action.type);
								process.send(data);
							}, action.number * 1000);
						}else{
							that.log.debug("Aktion ausführen:" + action.type);
							process.send(data);
						}
					}, sched);
					this.log.debug("		Neues Interval mit der id: " + id + " angelegt: jede " + action.number + ' ' + action.unit);
				}else{
					this.log.info("		Intervall wurde schon gesetzt: " + id);
				}
			}else{
				if(action.activeTimeout){
					var that = this;
					setTimeout(function(){
						that.log.debug("Aktion ausführen:" + action.type);
						process.send(data);
					}, action.number * 1000);
				}else{
					this.log.debug("Aktion ausführen:" + action.type);
					process.send(data);
				}
			}
		}, this);
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
		if(offset.active == true || offset.active == "true"){
			switch(offset.unit){
				case '+':
				case 'true':
				case true:
					offset.unit = true;
					break;
				case '-':
				case 'false':
				case false:
					offset.unit = false;
					break;
				case 'random':
					offset.unit = getRandomBoolean();
					if(new Date().getTime() > time){
						offset.unit = true;
					}
					break;
				default:
					offset.unit = true;
					break;
			}

			if(offset.random){
				offset.minutes = getRandomInt(offset.min, offset.max);
			}

			if(offset.unit == true){
				that.log.info("	Offset: 		" + offset.minutes + " Minuten später");
				var suntime = new Date(suntime.getTime() + (offset.minutes * 60000));
			}else{
				that.log.info("	Offset: 		" + offset.minutes + " Minuten früher");
				var suntime = new Date(suntime.getTime() - (offset.minutes * 60000));
			}
		}
		return createTime(suntime.getTime());
	}
	var checkVariables = function(timer, variable, that, switchToThis, switchtimer, callback){
		if(!variable){
			callback(timer, switchToThis, switchtimer);
		}else if(timer.variables[variable.id]){
			for (var i = timer.variables[variable.id].length - 1; i >= 0; i--) {
				var condition = timer.variables[variable.id][i];
				switch(condition.mode){
					case 'match':
						if(condition.value == variable.status.toString()){
							that.log.info('	Variable ' + condition.id + ' hat sich zu "' + variable.status + '" geändert!');
							switchToThis = 'on';
						}else{
							that.log.info('	Variable hat den falschen status');
							switchtimer = false;
						}
						break;
					case 'onChange':
						that.log.info('	Variable ' + condition.id + ' hat sich geändert');
						break;
					case "größer":
						if(condition.value < variable.status){
							that.log.info(condition.id + " ist größer als " + condition.value);
						}else{
							switchtimer = false;
							that.log.info("		Ergebnis: 	stimmt nicht");
						}
						break;
					case "kleiner":
						if(condition.value > variable.status){
							that.log.info(condition.id + " ist kleiner " + condition.value);
						}else{
							switchtimer = false;
							that.log.info("		Ergebnis: 	stimmt nicht");
						}
						break;
					case "gleich":
						if(condition.value.toString() === variable.status.toString()){
							that.log.info(condition.id + " ist gleich " + condition.value);
						}else{
							switchtimer = false;
							that.log.info("		Ergebnis: 	stimmt nicht");
						}
						break;
					case "ungleich":
						if(condition.value.toString() !== variable.status.toString()){
							that.log.info(condition.id + "ist ungleich " + condition.value);
						}else{
							switchtimer = false;
							that.log.info("		Ergebnis: 	stimmt nicht");
						}
						break;										
					case "größergleich":
						if(condition.value <= variable.status){
							that.log.info(condition.id + " ist größer oder gleich " + condition.value);
						}else{
							switchtimer = false;
							that.log.info("		Ergebnis: 	stimmt nicht");
						}
						break;
					case "kleinergleich":
						if(condition.value >= variable.status){
							that.log.info(condition.id + " ist kleiner oder gleich " + condition.value);
						}else{
							switchtimer = false;
							that.log.info("		Ergebnis: 	stimmt nicht");
						}
						break;
					default:
						that.log.error("Error:" + condition.mode);
						switchtimer = false;
						break;
				}
			}
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
		
		// Wenn noch nie ausgeführt dann letzte Ausführung auf vor 24 Stunden setzten
		if(!timer.lastexec){
			timer.lastexec = new Date().getTime() - 24 * 60 * 60000;
		}else{
			timer.lastexec = parseInt(timer.lastexec);
		}

		var switchNow = null;
		for (var i = timer.conditions.length - 1; i >= 0; i--) {
			var condition = timer.conditions[i];
			// that.log.debug(condition);
			switch(condition.type){
				case "range":
					that.log.info("	Prüfe Zeitraum...");
					that.log.info("		" + condition.start + " - " + condition.stop);
					var startTime = createTime(new Date().setHours(condition.start.hour, condition.start.minute));
					var stopTime = createTime(new Date().setHours(condition.stop.hour, condition.stop.minute));
				
					if(isTimeInRange(startTime.timestamp, stopTime.timestamp)){
						that.log.info("		Ergebnis: 	stimmt");
					}else{
						that.log.info("		Ergebnis: 	stimmt nicht");
						switchtimer = false;
					}
					break;
				case "sun":
					if(!that.calculatedSunTime){
						that.calculatedSunTime = getSuntime(condition.sun, condition.offset);
					}
					that.log.info("	Berechnete Zeit:	" + that.calculatedSunTime.time);
					var now = createTime(new Date().getTime());
					// console.log(timer.conditions, that.calculatedSunTime.time);
					if(timer.lastexec > that.calculatedSunTime.timestamp){
						that.log.info("		Dieser Timer wurde schon geschaltet");
						switchtimer = false;
					}else{
						if(now.time == that.calculatedSunTime.time){
							that.calculatedSunTime = false;
							that.log.info("		Ergebnis:	stimmt");
						}else{
							that.log.info("		Ergebnis: 	stimmt nicht");
							switchtimer = false;
						}
					}
					break;
				case "random":
					var now = createTime(new Date().getTime());
					// var startTime = parseTime(condition.start);
					// var stopTime = parseTime(condition.stop);
					var startTime = createTime(new Date().setHours(condition.start.hour, condition.start.minute));
					var stopTime = createTime(new Date().setHours(condition.stop.hour, condition.stop.minute));

					// Zeitraum prüfen
					if(startTime.timestamp <= now.timestamp && stopTime.timestamp >= now.timestamp){
						if(that.timer.lastexec > startTime.timestamp && that.timer.lastexec < stopTime.timestamp){
							// schon ausgeführt!
							that.log.info("	Timer schon ausgeführt");
							that.log.info("	Ergebnis: 	stimmt nicht");
							switchtimer = false;
						}else{
							// Noch nicht ausgeführt!
							if(!that.calculatedRandomTime){
								// Timestamp zum Schalten generieren
								var minutes = getRandomInt(now.timestamp, stopTime.timestamp);
								// that.log.info(new Date(minutes));
								that.calculatedRandomTime = createTime(minutes);
								that.log.info('	Neue Schaltzeit berechnet!');
							}
							that.log.info('	Schaltzeit:' + new Date(that.calculatedRandomTime.timestamp));
							if(that.calculatedRandomTime.time == now.time){
								// Schalten!!
								that.log.info('	Jetzt schalten!');
								that.calculatedRandomTime = false;
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
					break;
				case "variable":
					if(that.timer.lastexec > allVariables[condition.id].lastChange){
						that.log.info("		Ergebnis: stimmt nicht: 	bereits ausgeführt");
						switchtimer = false;
					}else{
						var variable = allVariables[condition.id];
						switch(condition.mode){
							case 'match':
								if(condition.status == variable.status.toString()){
									that.log.info('	Variable ' + condition.id + ' hat sich zu "' + variable.status + '" geändert!');
									switchToThis = 'on';
								}else{
									that.log.info('	Variable hat den falschen status');
									switchtimer = false;
								}
								break;
							case 'onChange':
								that.log.info('	Variable ' + condition.id + ' hat sich geändert');
								break;
							case "größer":
								if(condition.value < variable.status){
									that.log.info(condition.id + " ist größer als " + condition.value);
								}else{
									switchtimer = false;
									that.log.info("		Ergebnis: 	stimmt nicht");
								}
								break;
							case "kleiner":
								if(condition.value > variable.status){
									that.log.info(condition.id + " ist kleiner " + condition.value);
								}else{
									switchtimer = false;
									that.log.info("		Ergebnis: 	stimmt nicht");
								}
								break;
							case "gleich":
								if(condition.value.toString() === variable.status.toString()){
									that.log.info(condition.id + " ist gleich " + condition.value);
								}else{
									switchtimer = false;
									that.log.info("		Ergebnis: 	stimmt nicht");
								}
								break;
							case "ungleich":
								if(condition.value.toString() !== variable.status.toString()){
									that.log.info(condition.id + "ist ungleich " + condition.value);
								}else{
									switchtimer = false;
									that.log.info("		Ergebnis: 	stimmt nicht");
								}
								break;										
							case "größergleich":
								if(condition.value <= variable.status){
									that.log.info(condition.id + " ist größer oder gleich " + condition.value);
								}else{
									switchtimer = false;
									that.log.info("		Ergebnis: 	stimmt nicht");
								}
								break;
							case "kleinergleich":
								if(condition.value >= variable.status){
									that.log.info(condition.id + " ist kleiner oder gleich " + condition.value);
								}else{
									switchtimer = false;
									that.log.info("		Ergebnis: 	stimmt nicht");
								}
								break;
							default:
								that.log.error("Error:" + condition.mode);
								switchtimer = false;
								break;
						}
					}
					break;
				case "time":
					switchtimer = false;
					break;
				default:
					that.log.error(condition.type);
					break;
			}
		}

/*		if(timer.conditions.range){
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
*/
/*
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
*/
/*
			[
				{
					"id":"id",
					"mode":"gleich|größer|gleiner|ungleich|.."
				},
				{
					"id":"id",
					"mode":"gleich|größer|gleiner|ungleich|.."
					"status":23
				}
			]
*/
/*
		if(timer.conditions.variable){
			for(var i in timer.conditions.variable){
				var variable = timer.conditions.variable[i];
				if(that.timer.lastexec > allVariables[variable.id].lastChange){
					that.log.info("		Ergebnis: stimmt nicht: 	schon ausgeführt");
				}else{
					switch(variab.mode){
						case 'match':
							if(variab.status == variable.status.toString()){
								that.log.info('	Variable ' + variable.id + ' hat sich zu "' + variab.status + '" geändert!');
								switchToThis = 'on';
							}else{
								that.log.info('	Variable hat den falschen status');
								switchtimer = false;
							}
							break;
						case 'onChange':
							that.log.info('	Variable ' + variable.id + ' hat sich geändert');
							break;
						case "größer":
							if(variab.status > variable.status){
								that.log.info("		Ergebnis: 	stimmt");
							}else{
								switchtimer = false;
								that.log.info("		Ergebnis: 	stimmt nicht");
							}
							break;
						case "kleiner":
							if(variab.status < variable.status){
								that.log.info("		Ergebnis: 	stimmt");
							}else{
								switchtimer = false;
								that.log.info("		Ergebnis: 	stimmt nicht");
							}
							break;
						case "gleich":
							if(variab.status.toString() === variable.status.toString()){
								that.log.info("		Ergebnis: 	stimmt");
							}else{
								switchtimer = false;
								that.log.info("		Ergebnis: 	stimmt nicht");
							}
							break;
						case "ungleich":
							if(variab.status.toString() !== variable.status.toString()){
								that.log.info("		Ergebnis: 	stimmt");
							}else{
								switchtimer = false;
								that.log.info("		Ergebnis: 	stimmt nicht");
							}
							break;										
						case "größergleich":
							if(variab.status >= variable.status){
								that.log.info("		Ergebnis: 	stimmt");
							}else{
								switchtimer = false;
								that.log.info("		Ergebnis: 	stimmt nicht");
							}
							break;
						case "kleinergleich":
							if(variab.status <= variable.status){
								that.log.info("		Ergebnis: 	stimmt");
							}else{
								switchtimer = false;
								that.log.info("		Ergebnis: 	stimmt nicht");
							}
							break;
						default:
							that.log.error("Error:" + variab.mode);
							break;
					}
				}
			}
		}
*/
/*
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
			}
		}
*/
		// if(switchNow == true){
			// switchtimer = true;
		// }
/*
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
*/
		callback(timer, switchToThis, switchtimer);
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
			if(!that.timer.calculatedTime){
				that.timer.calculatedTime = new Date();
			}
			that.log.info(that.timer.calculatedTime);
			checkVariables(that.timer, variable, that, undefined, true, function(timer, switchToThis, switchtimer){
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