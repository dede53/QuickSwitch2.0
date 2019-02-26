var SunCalc						=	require('suncalc');
var conf						=	require('../../config.json');
var db							=	require('./database.js');
var later 						=	require('later');
var util						=	require("util");

if(!conf.location || !conf.location.lat || !conf.location.long){
	conf.location = {
		lat: 52.5,
		long: 13.4
	}
}

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
	timestamp = parseInt(timestamp);
	var query = "UPDATE `timer` SET `lastexec`= " + timestamp + " WHERE `id` = " + this.timer.id;
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

// Warum nicht this verwendet?? Wozu dann OOP? mit this kann kein Interval mehr doppelt gestartet werden, auch nicht manuell, jetzt schon.
createTimer.prototype.switchActions = function(status, switchtimer){
	var getRandomInt = function(min, max) {
		return Math.floor(Math.random() * (max - min)) + min;
	}
	if(this.timer.actions && switchtimer != false){
		this.timer.actions.forEach((action) => {
			// Hier macht die Rheinfolge keinen Sinn:
			var data = {};
			data[action.type] = action;
			if(action.offset == undefined){
				action.offset = {
					active:false
				}
			}
			if(action.activeInterval){
				action.id = parseInt(action.id) || getRandomInt(0, 600000);
				if(allIntervals.intervals[action.id] == undefined){
					var sched			=	later.parse.text('every ' + action.number + ' ' + action.unit);
					allIntervals.setMyInterval(action.id, function(){
						if(action.offset.active == true || action.offset.active == "true"){
							if(action.offset.random == true || action.offset.random == "true"){
								action.offset.minutes = getRandomInt(action.offset.min, action.offset.max);
							}
							setTimeout(() => {
								this.log.debug("Aktion ausführen:" + action.type);
								process.send(data);
							}, action.offset.minutes * 60 * 1000);
						}else{
							this.log.debug("Aktion ausführen:" + action.type);
							process.send(data);
						}
					}, sched);
					this.log.debug("		Neues Interval mit der id: " + action.id + " angelegt: jede " + action.number + ' ' + action.unit);
				}else{
					this.log.info("		Intervall wurde schon gesetzt: " + action.id);
				}
			}else{
				if(action.offset.active == true || action.offset.active == "true"){
					if(action.offset.random == true || action.offset.random == "true"){
						action.offset.minutes = getRandomInt(action.offset.min, action.offset.max);
					}
					setTimeout(() => {
						this.log.debug("Aktion ausführen:" + action.type);
						process.send(data);
					}, action.offset.minutes * 60 * 1000);
				}else{
					this.log.debug("Aktion ausführen:" + action.type);
					process.send(data);
				}
			}
			
		});
		this.setLastExec(new Date().getTime());
	}
}

createTimer.prototype.checkTimer = function(variable){
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
		var day = ("0" + time.getDate()).slice(-2);
		return {
			timestamp: time.getTime(),
			hours: time.getHours(),
			minutes: time.getMinutes(),
			time: hours + ':' + minutes,
			day: day
		}
	}

	var getSuntime = (tomorrow, type, offset) => {
		if(tomorrow){
			var suntimes			= SunCalc.getTimes(new Date(new Date().getTime() + 24 * 60 * 60 * 1000), conf.location.lat, conf.location.long);
		}else{
			var suntimes			= SunCalc.getTimes(new Date(), conf.location.lat, conf.location.long);
		}
		if(type == "sunrise"){
			var suntime 		= new Date(suntimes.sunrise);
			this.log.info("	Sonnenaufgang:	" + suntime.getHours() + ':' + suntime.getMinutes());
		}else{
			var suntime 		= new Date(suntimes.sunset);
			this.log.info("	Sonnenuntergang:	" + suntime.getHours() + ':' + suntime.getMinutes());
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
				this.log.info("	Offset: 		" + offset.minutes + " Minuten später");
				var suntime = new Date(suntime.getTime() + (offset.minutes * 60 * 1000));
			}else{
				this.log.info("	Offset: 		" + offset.minutes + " Minuten früher");
				var suntime = new Date(suntime.getTime() - (offset.minutes * 60 * 1000));
			}
		}
		return createTime(suntime.getTime());
	}
	var checkVariables = (variable, switchToThis, switchtimer, callback) => {
		if(!variable){
			callback(switchToThis, switchtimer);
		}else if(this.timer.variables[variable.id]){
			for (var i = this.timer.variables[variable.id].length - 1; i >= 0; i--) {
				var condition = this.timer.variables[variable.id][i];
				switch(condition.mode){
					case 'match':
						if(condition.value == variable.status.toString()){
							this.log.info('	Variable ' + condition.id + ' hat sich zu "' + variable.status + '" geändert!');
							switchToThis = 'on';
						}else{
							this.log.info('	Variable hat den falschen status');
							switchtimer = false;
						}
						break;
					case 'onChange':
						this.log.info('	Variable ' + condition.id + ' hat sich geändert');
						break;
					case "größer":
						if(condition.value < variable.status){
							this.log.info(condition.id + " ist größer als " + condition.value);
						}else{
							switchtimer = false;
							this.log.info("		Ergebnis: 	stimmt nicht");
						}
						break;
					case "kleiner":
						if(condition.value > variable.status){
							this.log.info(condition.id + " ist kleiner " + condition.value);
						}else{
							switchtimer = false;
							this.log.info("		Ergebnis: 	stimmt nicht");
						}
						break;
					case "gleich":
						if(condition.value.toString() === variable.status.toString()){
							this.log.info(condition.id + " ist gleich " + condition.value);
						}else{
							switchtimer = false;
							this.log.info("		Ergebnis: 	stimmt nicht");
						}
						break;
					case "ungleich":
						if(condition.value.toString() !== variable.status.toString()){
							this.log.info(condition.id + "ist ungleich " + condition.value);
						}else{
							switchtimer = false;
							this.log.info("		Ergebnis: 	stimmt nicht");
						}
						break;										
					case "größergleich":
						if(condition.value <= variable.status){
							this.log.info(condition.id + " ist größer oder gleich " + condition.value);
						}else{
							switchtimer = false;
							this.log.info("		Ergebnis: 	stimmt nicht");
						}
						break;
					case "kleinergleich":
						if(condition.value >= variable.status){
							this.log.info(condition.id + " ist kleiner oder gleich " + condition.value);
						}else{
							switchtimer = false;
							this.log.info("		Ergebnis: 	stimmt nicht");
						}
						break;
					default:
						this.log.error("Error:" + condition.mode);
						switchtimer = false;
						break;
				}
			}
			callback(switchToThis, switchtimer);
		}
	}

	var checkConditions = (allVariables, switchToThis, switchtimer, callback) => {
		if(switchtimer == false || switchtimer == "false"){
			return;
		}
		if(!this.timer.conditions){
			this.log.info("	Keine Bedingungen für diesen Timer");
			this.log.info("		Ergebnis: 	stimmt");
			callback(this.timer, switchToThis, true);
			return;
		}
		
		// Wenn noch nie ausgeführt dann letzte Ausführung auf vor 24 Stunden setzten
		if(!this.timer.lastexec){
			this.timer.lastexec = new Date().getTime() - 24 * 60 * 60000;
		}else{
			this.timer.lastexec = parseInt(this.timer.lastexec);
		}

		var switchNow = null;
		for (var i = this.timer.conditions.length - 1; i >= 0; i--) {
			var condition = this.timer.conditions[i];
			// this.log.debug(condition);
			switch(condition.type){
				case "range":
					this.log.info("	Prüfe Zeitraum...");
					this.log.info("		" + condition.start + " - " + condition.stop);
					var startTime = createTime(new Date().setHours(condition.start.hour, condition.start.minute));
					var stopTime = createTime(new Date().setHours(condition.stop.hour, condition.stop.minute));
				
					if(isTimeInRange(startTime.timestamp, stopTime.timestamp)){
						this.log.info("		Ergebnis: 	stimmt");
					}else{
						this.log.info("		Ergebnis: 	stimmt nicht");
						switchtimer = false;
					}
					break;
				case "sun":
					var now = createTime(new Date().getTime());
					if(!this.calculatedSunTime){
						this.calculatedSunTime = getSuntime(false, condition.sun, condition.offset);
						if(this.calculatedSunTime.timestamp < now.timestamp){
							this.calculatedSunTime = getSuntime(true, condition.sun, condition.offset);
						}
					}
					this.log.info("	Berechnete Zeit:	" + new Date(this.calculatedSunTime.timestamp));
					// console.log(timer.conditions, this.calculatedSunTime.time);
					if(this.timer.lastexec > this.calculatedSunTime.timestamp){
						this.log.info("		Dieser Timer wurde schon geschaltet");
						switchtimer = false;
					}else{
						if(now.time == this.calculatedSunTime.time && now.day == this.calculatedSunTime.day){
							this.calculatedSunTime = getSuntime(true, condition.sun, condition.offset);
							this.log.info("		Ergebnis:	stimmt");
						}else{
							this.log.info("		Ergebnis: 	stimmt nicht");
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
						if(this.timer.lastexec > startTime.timestamp && this.timer.lastexec < stopTime.timestamp){
							// schon ausgeführt!
							this.log.info("	Timer schon ausgeführt");
							this.log.info("	Ergebnis: 	stimmt nicht");
							switchtimer = false;
						}else{
							// Noch nicht ausgeführt!
							if(!this.calculatedRandomTime){
								// Timestamp zum Schalten generieren
								var minutes = getRandomInt(now.timestamp, stopTime.timestamp);
								// this.log.info(new Date(minutes));
								this.calculatedRandomTime = createTime(minutes);
								this.log.info('	Neue Schaltzeit berechnet!');
							}
							this.log.info('	Schaltzeit:' + new Date(this.calculatedRandomTime.timestamp));
							if(this.calculatedRandomTime.time == now.time){
								// Schalten!!
								this.log.info('	Jetzt schalten!');
								this.calculatedRandomTime = false;
								this.log.info("		Ergebnis: 	stimmt");
								switchNow = true;
								switchToThis = condition.action;
							}else{
								this.log.info('	Ergebnis: 	stimmt nicht');
								switchtimer = false;
							}
						}
					}else{
						this.log.info("	Uhrzeit nicht zwischen " + startTime.time + " und " + stopTime.time);
						this.log.info("	Ergebnis: 	stimmt nicht");
						switchtimer = false;
					}
					break;
				case "variable":
					if(this.timer.lastexec > allVariables[condition.id].lastChange){
						this.log.info("		Ergebnis: stimmt nicht: 	bereits ausgeführt");
						switchtimer = false;
					}else{
						var variable = allVariables[condition.id];
						switch(condition.mode){
							case 'match':
								if(condition.status == variable.status.toString()){
									this.log.info('	Variable ' + condition.id + ' hat sich zu "' + variable.status + '" geändert!');
									switchToThis = 'on';
								}else{
									this.log.info('	Variable hat den falschen status');
									switchtimer = false;
								}
								break;
							case 'onChange':
								this.log.info('	Variable ' + condition.id + ' hat sich geändert');
								break;
							case "größer":
								if(condition.value < variable.status){
									this.log.info(condition.id + " ist größer als " + condition.value);
								}else{
									switchtimer = false;
									this.log.info("		Ergebnis: 	stimmt nicht");
								}
								break;
							case "kleiner":
								if(condition.value > variable.status){
									this.log.info(condition.id + " ist kleiner " + condition.value);
								}else{
									switchtimer = false;
									this.log.info("		Ergebnis: 	stimmt nicht");
								}
								break;
							case "gleich":
								if(condition.value.toString() === variable.status.toString()){
									this.log.info(condition.id + " ist gleich " + condition.value);
								}else{
									switchtimer = false;
									this.log.info("		Ergebnis: 	stimmt nicht");
								}
								break;
							case "ungleich":
								if(condition.value.toString() !== variable.status.toString()){
									this.log.info(condition.id + "ist ungleich " + condition.value);
								}else{
									switchtimer = false;
									this.log.info("		Ergebnis: 	stimmt nicht");
								}
								break;										
							case "größergleich":
								if(condition.value <= variable.status){
									this.log.info(condition.id + " ist größer oder gleich " + condition.value);
								}else{
									switchtimer = false;
									this.log.info("		Ergebnis: 	stimmt nicht");
								}
								break;
							case "kleinergleich":
								if(condition.value >= variable.status){
									this.log.info(condition.id + " ist kleiner oder gleich " + condition.value);
								}else{
									switchtimer = false;
									this.log.info("		Ergebnis: 	stimmt nicht");
								}
								break;
							default:
								this.log.error("Error:" + condition.mode);
								switchtimer = false;
								break;
						}
					}
					break;
				case "time":
					var time = createTime(new Date().setHours(condition.time.hour, condition.time.minute));
					var now = createTime( new Date().getTime() );
					if(this.timer.lastexec > now.timestamp){
						this.log.info("		Dieser Timer wurde schon geschaltet");
						switchtimer = false;
					}else{
						if(now.time == time.time ){
							this.log.info("		" + now.time + " == " + time.time); 
							this.log.info("		Ergebnis:	stimmt");
						}else{
							this.log.info("		" + now.time + " != " + time.time); 
							this.log.info("		Ergebnis:	stimmt nicht");
							switchtimer = false;
						}
					}
					break;
				case "weekdays":
					if(!condition.weekdays[new Date().getDay()]){
						this.log.info("		Der Wochentag stimmt nicht!");
						switchtimer = false;
					}else{
						this.log.info("		Der Wochentag stimmt!");
					}
					break;
				default:
					this.log.error(condition.type);
					break;
			}
		}
		callback(switchToThis, switchtimer);
	}
	
	var query = "SELECT * FROM variable;";
	db.all(query, (err, variables) => {
		if(err){
			this.log.error(err);
		}
		allVariables = {};
		variables.forEach((variable) => {
			allVariables[variable.id] = variable;
		});
		if(this.timer.active == true || this.timer.active == 'true'){
			this.log.info(this.timer.name);
			if(!this.timer.calculatedTime){
				this.timer.calculatedTime = new Date();
			}
			checkVariables(variable, undefined, true, (switchToThis, switchtimer) => {
				checkConditions(allVariables, switchToThis, switchtimer, (switchToThis, switchtimer) => {
					this.switchActions(switchToThis, switchtimer);
				});
			});
		}
	});
}

createTimer.prototype.setActive = function(status, callback){
	if(status == true || status == 'true'){
		status = true;
		this.timer.active = true;
		this.interval = setInterval(() => {
			this.checkTimer();
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

createTimer.prototype.stopTimer = function() {
	clearInterval(this.interval);
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