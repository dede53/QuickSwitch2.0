var helper = require('../functions/helper.js');

module.exports = function(app, db){
	var timerFunctions = require('../functions/timer.js');
	/*****************************************
	* Socket.io routes für Timer
	*
	*
	*
	* Liefert alle Timer
	*****************************************/
	app.io.route('timers', function(req, res){
		timerFunctions.getTimers(function(data){
			data.forEach(function(timer){
				req.io.emit('timer', timer);
			});
		});
	});
	app.io.route('timer', function(req, res){
		console.log(req.data);
		timerFunctions.getTimer(req.data, function(data){
			data.forEach(function(timer){
				console.log(timer);
				req.io.emit('timer', timer);
			});
		});
	});
	/*****************************************
	* legt einen neuen Timer an
	*****************************************/
	app.io.route('saveTimer', function(req){
		timerFunctions.saveTimer(req.data, function(err, data){
			if(err){
				console.log(err);
			}else{
				app.io.broadcast('timer', data);
			}
		});
	});

	app.io.route('switchTimer', function(req){
		var data = req.data;
		timerFunctions.switchTimer(data, function(status){
			if(status == 200){
				timerFunctions.getTimer(data.id, function(timer){
					app.io.broadcast('timer', timer);
				});
			}
		});
	});

	app.io.route('testActions', function(req){
		timerFunctions.switchActions(req.data,true, true);
	});
	/*****************************************
	* löscht einen Countdown
	*****************************************/
	app.io.route('deleteTimer', function(req, res){
		var id = req.data.id;
		helper.log.debug("Lösche den Timer mit der id:" + id);
		timerFunctions.deleteTimer(id, app);
	});
}