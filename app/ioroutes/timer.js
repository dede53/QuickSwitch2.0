var helper = require('../functions/helper.js');

module.exports = function(app, db){
	var timerFunctions = require('../functions/timer.js');
	/*****************************************
	* Socket.io routes für Countdowns
	*
	*
	*
	* Liefert alle Countdowns
	*****************************************/
	app.io.route('timers', function(req, res){
		timerFunctions.getTimers(req, res, function(data){
			data.forEach(function(timer){
				req.io.emit('timer', timer);
			});
		});
	});
	/*****************************************
	* legt einen neuen Countdown an
	*****************************************/
	app.io.route('newTimer', function(req){
		data = req.data;
		data.settime = Math.floor(Date.parse(new Date));

		data.time = data.settime + (data.time * 60000);
		app.io.broadcast('newTimer', data);
		timerFunctions.saveNewTimer(req.data, function(data){
			if(data != "200"){
				helper.log.error("Nachricht konnte nicht gespeichert werden!");
				helper.log.error( data );
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
	/*****************************************
	* löscht einen Countdown
	*****************************************/
	app.io.route('deleteTimer', function(req, res){
		var id = req.data.id;
		helper.log.debug("Lösche den Timer mit der id:" + id);
		timerFunctions.deleteTimer(id, function(data){
			timerFunctions.getTimers(req, res, function(data){
				data.forEach(function(timer){
					app.io.broadcast('timer', timer);
				});
			});
		});
	});
}