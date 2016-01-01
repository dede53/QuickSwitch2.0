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
			req.io.emit('timers', data);
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
				log("Nachricht konnte nicht gespeichert werden!", "error");
				log( data , "error");
			}
		});
	});
	/*****************************************
	* löscht einen Countdown
	*****************************************/
	app.io.route('deleteTimer', function(req, res){
		var id = req.data.id;
		timerFunctions.deleteTimer(id, req, res, function(data){
			getTimers(req, res, function(data){
				app.io.broadcast('timers', data);
			});
		});
	});
}