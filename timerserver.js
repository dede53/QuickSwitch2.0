var config						=	require('./config.json');
var db							=	require('./app/functions/database.js');
var variableFunctions			=	require('./app/functions/variable.js');
var timerFunctions				=	require('./app/functions/timer.js');
var createVariable				=	require('./app/functions/newVariable.js');
var createTimer					=	require('./app/functions/newTimer.js');
var later 						=	require('later');

log = {
	"info": function(data){
		if(config.loglevel == 1 ){
			process.send({log:data});
		}
	},
	"debug": function(data){
		if(config.loglevel <= 2){
			process.send({log:data});
		}
	},
	"warning": function(data){
		if(config.loglevel <= 3){
			process.send({log:data});
		}
	},
	"error": function(data){
		if(config.loglevel <= 4){
			process.send({log:data});
		}
	},
	"pure": function(data){
        process.send({log:data});
	}
}

var allTimers					=	{};
var allVariables				=	{};
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

process.on('message', function(data){
	if(data.deaktivateInterval){
		allTimers[data.deaktivateInterval].deaktivateInterval();
	}
	if(data.loadVariables){
		loadVariables();
	}
	if(data.setSaveActive){
		allVariables[data.setSaveActive.id].setSaveActive(data.setSaveActive.status);
	}
	if(data.setVariable){
		try{
			allVariables[data.setVariable.id].setVariable(data.setVariable.status, function(id, variable){
				allTimers[id].checkTimer(variable);
			});
		}catch(e){
			allVariables[data.setVariable.id] = new createVariable(data.setVariable, config);
			allVariables[data.setVariable.id].setVariable(data.setVariable.status, function(id, variable){
				allTimers[id].checkTimer(variable);
			});
		}
	}
	if(data.saveVariable){
		if(allVariables[data.saveVariable.uid]){
			allVariables[data.saveVariable.id].saveVariable(data.saveVariable);
		}else{
            allVariables[data.saveVariable.id] = new createVariable(data.saveVariable, config);
			allVariables[data.saveVariable.id].saveVariable(data.saveVariable);
			allVariables[data.saveVariable.id].setVariable(data.saveVariable.status, function(id, variable){
				allTimers[id].checkTimer(variable);
            });
		}
	}

	if(data.setTimerActive){
		if(allTimers[data.setTimerActive.id].timer.variables){
			if(data.setTimerActive.active == true || data.setTimerActive.active == "true"){
				var variables = Object.keys(allTimers[data.setTimerActive.id].timer.variables);
				variables.forEach(function(variable){
					allVariables[variable].dependendTimer.push(data.setTimerActive.id);
				});
			}else{
				var variables = Object.keys(allTimers[data.setTimerActive.id].timer.variables);
				variables.forEach(function(variable){
					allVariables[variable].dependendTimer.splice(allVariables[variable].dependendTimer.indexOf(data.setTimerActive.id), 1);
				});
			}
			var query = "UPDATE timer SET active='" + data.setTimerActive.active + "' WHERE id ='" + data.setTimerActive.id + "';"
			db.run(query);
		}else{ 
			allTimers[data.setTimerActive.id].setActive(data.setTimerActive.active);
		}
	}
	if(data.deleteTimer){
		allTimers[data.deleteTimer.id].deleteTimer(function(){});
	}
	if(data.switchActions){
		allTimers[data.switchActions.id].switchActions(data.switchActions, true, true);
	}
	if(data.saveTimer){
		allTimers[data.saveTimer.id].saveTimer(data.saveTimer, function(){});
	}
	if(data.loadTimers){
		unLoadTimers(function(){
			loadTimers();
		});
	}
	if(data.getUserTimers){
		createTimer().getUserTimers(function(timer){
			process.send({"req": data.req, "getUserTimers": timer});
		});
	}
});

loadVariables();
loadTimers();


function loadVariables(){
	var query = "SELECT * FROM variable;";
	db.all(query, function(err, variables){
		if(err){
			log.error(err);
			return;
		}
		variables.forEach(function(variable){
			allVariables[variable.id] = new createVariable(variable, config);
		});
		log.info("Alle Variablen geladen");
	});
}

function loadTimers(){
	var query = "SELECT id, name, active, variables, conditions, actions, user, lastexec FROM timer;";
	db.all(query, function(err, timers){
		if(err){
			log.error(err);
			return;
		}else{
			timers.forEach(function(timer){
				allTimers[timer.id] 			= new createTimer(timer, config);
				if(timer.active == true || timer.active == "true" ){
					if(allTimers[timer.id].timer.variables){
						var variables = Object.keys(allTimers[timer.id].timer.variables);
						variables.forEach(function(variable){
							try{
								allVariables[variable].dependendTimer.push(timer.id);
							}catch(e){
								log.error("Variable ist nicht vorhanden!");
							}
						});
						var query = "UPDATE timer SET active='true' WHERE id ='" + timer.id + "';"
						db.run(query);
					}else{ 
						allTimers[timer.id].setActive(true);
					}
				}
			});
		}
		log.info("Alle Timer geladen");
	});
}

function unLoadTimers(cb){
	for(var timerId in allTimers){
		if(allTimers[timerId].timer.variables){
			var variables = Object.keys(allTimers[timerId].timer.variables);
			variables.forEach(function(variable){
				allVariables[variable].dependendTimer.splice(allVariables[variable].dependendTimer.indexOf(timerId), 1);
			});
		}else{
			allTimers[timerId].stopTimer();
		}
	}
	allTimers = {};
	cb();
}

process.on('disconnect', function(error){
	process.exit();
});