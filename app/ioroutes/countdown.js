var helper = require('../functions/helper.js');

module.exports = function(app, db){
	var countdownFunctions = require('../functions/countdown.js');
	/*****************************************
	* Socket.io routes für Countdowns
	*
	*
	*
	* Liefert alle Countdowns
	*****************************************/
	app.io.route('countdowns', function(req, res){
		countdownFunctions.getCountdowns(req, res, function(data){
			req.io.emit('countdowns', data);
		});
	});
	/*****************************************
	* legt einen neuen Countdown an
	*****************************************/
	app.io.route('newCountdowntimer', function(req, res){
		var data = req.data;
		data.settime = Math.floor(Date.parse(new Date));
		
		data.time = data.settime + (data.time * 60000);
		countdownFunctions.setNewCountdown(data, function(data){
			if(data != "200"){
				helper.log.error("Nachricht konnte nicht gespeichert werden!");
				helper.log.error( data );
			}else{	
				countdownFunctions.getCountdowns(req, res, function(data){
					app.io.broadcast('countdowns', data);
				});
			}
		});
	});
	/*****************************************
	* löscht einen Countdown
	*****************************************/
	app.io.route('deleteCountdown', function(req, res){
		var id = req.data.id;
		countdownFunctions.deleteCountdown(id, req, res, function(data){
			countdownFunctions.getCountdowns(req, res, function(data){
				app.io.broadcast('countdowns', data);
			});
		});
	});
}