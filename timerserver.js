var events 						= 	require('events');
var config						=	require('./config.json');
var db							=	require('./app/functions/database.js');
var createTimer					=	require('./app/functions/newTimer.js');

class allTimers extends events {
	constructor(log, allVariables){
		super();
		this.log 			= log;
		this.timer 			= new Array();
		this.variables 		= new Object;
		this.loadTimers();
	}
}

allTimers.prototype.deaktivateInterval = function(id){
	this[id].deaktivateInterval();
}

allTimers.prototype.getTimer = function(id){
	return this[id].timer;
}

allTimers.prototype.getUserTimers = function(user, callback){
	var query = "SELECT id, name, active, variables, conditions, actions, user, lastexec FROM timer WHERE user = '" + user + "';";
	db.all(query, (err, data) => {
		if(err){
			callback(404);
			helper.log.error(err);
		}else{
			var timers = {};
			for(var i = 0; i< data.length; i++){
				timers[data[i].id] = this[data[i].id].timer;
			}
			callback(timers);
		}
	});
}

allTimers.prototype.setVariable = function(variable){
	var vars = this.variables[variable.id];
	for(var id in vars){
		this[vars[id]].checkTimer(variable);
	}
}

allTimers.prototype.setActive = function(data){
	if(this[data.id].timer.variables){
		if(data.active == true || data.active == "true"){
			var variables = Object.keys(this[data.id].timer.variables);
			variables.forEach(variable => {
				try{
					this.variables[variable].push(data.id);
				}catch(e){
					this.variables[variable] = new Array();
					this.variables[variable].push(data.id);
				}
			});
		}else{
			var variables = Object.keys(this[data.id].timer.variables);
			variables.forEach(variable => {
				try{
					this.variables[variable].splice(this.variables[variable].indexOf(data.id), 1);
				}catch(e){}
			});
		}
		var query = "UPDATE timer SET active='" + data.active + "' WHERE id ='" + data.id + "';"
		db.run(query);
	}else{ 
		this[data.id].setActive(data.active);
	}
}

allTimers.prototype.deleteTimer = function(id, cb){
	this[id].deleteTimer(cb);
}

allTimers.prototype.switchActions = function(data){
	this[data.id].switchActions(data);
}

allTimers.prototype.saveTimer = function(data, callback){
	if(!data.lastexec){
		data.lastexec = new Date().getTime();
	}
	if(data.id){
		this[data.id].saveTimer(data, callback);
	}else{
		var query = "INSERT INTO timer (name, variables, conditions, actions, user, lastexec) VALUES ('" + data.name + "', '" + JSON.stringify(data.variables) + "', '" + JSON.stringify(data.conditions) + "', '" + JSON.stringify(data.actions) + "','" + data.user + "','" + data.lastexec + "');";
		// db.run(query);
		db.all(query, (err, res) => {
			if(err){
				callback(err, undefined);
			}else{
				data.id = res.insertId;
				this[data.id] = new createTimer(data, config);
				this.timer.push(data.id);
				if(data.active == true || data.active == "true" ){
					if(this[data.id].timer.variables){
						var variables = Object.keys(this[data.id].timer.variables);
						variables.forEach(variable => {
							try{
								this.variables[variable].push(timer.id);
							}catch(e){
								this.variables[variable] = new Array();
								this.variables[variable].push(timer.id);
							}
						});
						var query = "UPDATE timer SET active='true' WHERE id ='" + data.id + "';"
						db.run(query);
					}else{ 
						this[data.id].setActive(true);
					}
				}
				this[data.id].on("switchAction", (data) => {
					this.emit("switchAction", data);
				})
				this[data.id].on("log", (data) => {
					this.log[data.type](data.message);
				})
				callback( undefined, this[data.id].timer);
			}
		});
	}
}

allTimers.prototype.loadTimers = function(){
	var query = "SELECT id, name, active, variables, conditions, actions, user, lastexec FROM timer;";
	db.all(query, (err, timers) => {
		if(err){
			log.error(err);
			return;
		}else{
			timers.forEach((timer) => {
				this[timer.id] 			= new createTimer(timer, config);
				this.timer.push(timer.id);
				if(timer.active == true || timer.active == "true" ){
					if(this[timer.id].timer.variables){
						var variables = Object.keys(this[timer.id].timer.variables);
						variables.forEach(variable => {
							try{
								this.variables[variable].push(timer.id);
							}catch(e){
								this.variables[variable] = new Array();
								this.variables[variable].push(timer.id);
							}
						});
						var query = "UPDATE timer SET active='true' WHERE id ='" + timer.id + "';"
						db.run(query);
					}else{
						this[timer.id].setActive(true);
					}
				}
				this[timer.id].on("switchAction", (data) => {
					this.emit("switchAction", data);
				})
				this[timer.id].on("log", (data) => {
					this.log[data.type](data.message);
				})
			});
		}
		log.info("Alle Timer geladen");
	});
}

allTimers.prototype.unLoadTimers = function(cb){
	for(var timerId in this.timer){
		if(this[timerId].timer.variables){
			var variables = Object.keys(this[timerId].timer.variables);
			variables.forEach(function(variable){
				allVariables.variables[variable].dependendTimer.splice(allVariables.variables[variable].dependendTimer.indexOf(timerId), 1);
			});
		}else{
			this[timerId].stopTimer();
		}
	}
	allTimers = new allTimers();
	cb();
}

module.exports = allTimers;