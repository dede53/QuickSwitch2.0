var SunCalc						=	require('suncalc');
var db							=	require('./database.js');
var later 						=	require('later');
var events 						=	require('events');

function intervals(){
	this.intervals = {};
	this.setMyInterval =  (id, callback, sched) => {
		this.intervals[id] = later.setInterval(callback, sched);
	}
	this.clearInterval = (id) => {
		this.intervals[id].clear();
		delete this.intervals[id];
	}
};
var allIntervals = new intervals();

class createTimer extends events {
	constructor(timer, config){
		super();
		this.timer 			= timer;
		this.config 		= config;
		// needed for the sunset/sunrise condition
		if(!this.config.location || !this.config.location.lat || !this.config.location.long){
			this.config.location = {
				lat: 52.5,
				long: 13.4
			}
		}
		try{
			if(this.timer.active == undefined){
				this.timer.active = true;
			}
			if(timer.variables != "" && typeof timer.variables == "string"){
				timer.variables = JSON.parse(timer.variables.trim());
			}else if(typeof timer.variables != "object"){
				timer.variables = false;
			}
			if(timer.conditions != "" && typeof timer.conditions == "string"){
				timer.conditions = JSON.parse(timer.conditions.trim());
			}else if(typeof timer.conditions != "object"){
				timer.conditions = false;
			}
			if(timer.actions != "" && typeof timer.actions == "string"){
				timer.actions = JSON.parse(timer.actions.trim());
			}else if(typeof timer.actions != "object"){
				timer.actions = false;
			}
		}catch(e){
			throw e;
		};
		var logfunction = (type) => {
			return (message) => {
				if(this.config.loglevel == 1 ){
					var data = {
						"message": message,
						"type": type
					}
					this.emit("log", data);
				}
			}
		}
		this.log = {
			"info": logfunction("info"),
			"debug": logfunction("debug"),
			"warning": logfunction("warning"),
			"error": logfunction("error"),
			"pure": logfunction("pure")
		}
		this.log.error("newTimer.constructor");
		this.log.info("newTimer.constructor");
	}
}



createTimer.prototype.setLastExec = function(timestamp){
	timestamp = parseInt(timestamp);
	var query = "UPDATE `timer` SET `lastexec`= " + timestamp + " WHERE `id` = " + this.timer.id;
	db.run(query);
	this.timer.lastexec = timestamp;
}

createTimer.prototype.deaktivateInterval = function(){
	if(this.timer.actions.intervals){
		this.timer.actions.intervals.forEach((interval) => {
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
		db.all(query, (err, data) => {
			if(err){
				callback(err, undefined);
			}else{
				this.timer.id = data.insertId; 
				getTimer(data.insertId, (data) => {
					this.log.info(data);
					callback( undefined, data);
				});
			}
		});
	}
};

createTimer.prototype.deleteTimer = function(callback){
	this.deaktivateInterval();
	clearInterval(this.interval);
	var query = "DELETE FROM timer WHERE id = '" + this.timer.id + "';";
	db.all(query, (err, data) => {
		callback(err, data);
	});
};

// Warum nicht this verwendet?? Wozu dann OOP? mit this kann kein Interval mehr doppelt gestartet werden, auch nicht manuell, jetzt schon.
createTimer.prototype.switchActions = function(status, switchtimer){
	var getRandomInt = (min, max) => {
		return Math.floor(Math.random() * (max - min)) + min;
	}
	if(this.timer.actions && switchtimer != false){
		this.timer.actions.forEach((action) => {
			var data = {};
			if(action.offset == undefined){
				action.offset = {
					active:false
				}
			}
			data[action.type] = action;
			if(action.activeInterval){
				action.id = parseInt(action.id) || getRandomInt(0, 600000);
				if(allIntervals.intervals[action.id] == undefined){
					var sched			=	later.parse.text('every ' + action.number + ' ' + action.unit);
					allIntervals.setMyInterval(action.id, () => {
						if(action.offset.active == true || action.offset.active == "true"){
							if(action.offset.random == true || action.offset.random == "true"){
								action.offset.minutes = getRandomInt(action.offset.min, action.offset.max);
							}
							setTimeout(() => {
								this.log.debug("Aktion ausführen:" + action.type);
								this.emit("switchAction", data);
							}, action.offset.minutes * 60 * 1000);
						}else{
							this.log.debug("Aktion ausführen:" + action.type);
							this.emit("switchAction", data);
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
						this.emit("switchAction", data);
					}, action.offset.minutes * 60 * 1000);
				}else{
					this.log.debug("Aktion ausführen:" + action.type);
					this.emit("switchAction", data);
				}
			}
			
		});
		this.setLastExec(new Date().getTime());
	}
}

createTimer.prototype.checkTimer = function(variable){
	var getRandomInt = (min, max) => {
		return Math.floor(Math.random() * (max - min)) + min;
	}
	var isTimeInRange = (lower, upper) => {
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
	var createTime = (givenTime) => {
		var time = new Date();
		try{
			if(typeof givenTime == 'number'){
				time = new Date(parseInt(givenTime));
			}else if(typeof givenTime == 'object'){
				// Workaround for mirgration of old versions
				time = new Date();
				time.setHours(givenTime.hour || 0, givenTime.minute || 0);
			}else{
				time = new Date(givenTime);
			}
		}catch(e){
			time = new Date();
		}
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
			var suntimes			= SunCalc.getTimes(new Date(new Date().getTime() + 24 * 60 * 60 * 1000), this.config.location.lat, this.config.location.long);
		}else{
			var suntimes			= SunCalc.getTimes(new Date(), this.config.location.lat, this.config.location.long);
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
					var startTime = createTime(condition.start);
					var stopTime = createTime(condition.stop);
				
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
					var startTime = createTime(condition.start);
					var stopTime = createTime(condition.stop);

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
					this.log.info(`		Check Variable: ${condition.id} ${condition.mode} ${condition.value.toString()}`);
					if(this.timer.lastexec > allVariables[condition.id].lastChange){
						this.log.info("		Ergebnis: stimmt nicht: 	seit der letzten Variablenänderung bereits ausgeführt");
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
					var time = createTime(condition.time);
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
		this.timer.active = "true";
		this.interval = setInterval(() => {
			this.checkTimer();
		}, 10 * 1000);
	}else{
		status = false;
		this.timer.active = "false";
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
	db.all(query, (err, data) => {
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