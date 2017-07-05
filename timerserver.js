var config						=	require('./config.json');
var db							=	require('./app/functions/database.js');
var variableFunctions			=	require('./app/functions/variable.js');
var timerFunctions				=	require('./app/functions/timer.js');
var createVariable				=	require('./app/functions/newVariable.js');
var createTimer					=	require('./app/functions/newTimer.js');
var later 						=	require('later');

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
		allTimers[data.deaktivateInterval].deaktivateInterval(data.deaktivateInterval);
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
				console.log(id, variable.status);
				allTimers[id].checkTimer(variable);
			});
		}catch(e){
			console.log(e);
		}
	}
	if(data.saveVariable){
		allVariables[data.saveVariable.id].saveVariable(data.saveVariable);
	}

	if(data.setTimerActive){
		allTimers[data.setTimerActive.id].setActive(data.setTimerActive.active);
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
		loadTimers();
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
			console.log(err);
			return;
		}
		variables.forEach(function(variable){
			allVariables[variable.id] = new createVariable(variable);
		});
		console.log("Alle Variablen geladen");
	});
}

function loadTimers(){
	var query = "SELECT id, name, active, variables, conditions, actions, user, lastexec FROM timer;";
	db.all(query, function(err, timers){
		if(err){
			console.log(err);
			return;
		}else{
			timers.forEach(function(timer){
				allTimers[timer.id] 			= new createTimer(timer, config);
				if(timer.active == true || timer.active == "true" ){
					if(allTimers[timer.id].timer.variables){
						var variables = Object.keys(allTimers[timer.id].timer.variables);
						variables.forEach(function(variable){
							allVariables[variable].dependendTimer.push(timer.id);
						});
					}else{ 
						allTimers[timer.id].setActive(true);
					}
				}
			});
		}
		console.log("Alle Timer geladen");
	});
}

// setTimeout(function(){
// 	allVariables['fritzbox.status'].on('variable', function(data){
// 		// console.log(data.id);
// 	});
// }, 1000);
