var db 				= require('./database.js');
var async 			= require("async");
var deviceFunctions = require('./device.js');
var helper 			= require('./helper.js');

module.exports = {
	/*****************************************
	* Liefert alle Countdowns
	*****************************************/
	getCountdowns: function(user, callback){
		var query = "SELECT countdowns.id, countdowntypen.type, countdowns.switchid, countdowns.time, countdowns.status, countdowns.user FROM countdowns, countdowntypen WHERE countdowns.type = countdowntypen.id AND countdowns.user = '"+ user +"';";
		db.all(query, function(err, row){
			if(err){
				helper.log.error(err, "error");
			}else{
				var bla = {};
				async.each(row,
					function(row, callback){
						deviceFunctions.getDevice(row.switchid, function(device){
							row.device = device;
							bla[row.id] = row;
							callback()
						});
					},
					function(err){
						if(err){
							helper.log.error(err, "error");
						}else{
							callback(bla);
						}
					}
				);
			}
		});
	},
	/*****************************************
	* löscht einen Countdown
	*****************************************/
	deleteCountdown: function(id, callback) {
		var query = "DELETE FROM countdowns WHERE id = "+ id +";";
		db.all(query ,function(err,rows){
			if(err){
				helper.log.error(err, "error");
				callback('Error: ' + err);
			}else{
				helper.log.info('Delete Countdown with id: ' + id, "info");
				callback("200");
			}
		});
	},
	/*****************************************
	* setzt einen neuen Countdown
		data = {
			time:schaltzeit in timestamp/ms
			device: Gerät als Object
			switchstatus: Aktion wie geschaltet wird
		}

	* Callback: 200 bei erfolg
				error bei fehler
	*****************************************/
	setNewCountdown: function (data, callback){
		var query = "INSERT INTO countdowns (type, time, switchid, status, user) VALUES ('1','"+ data.time +"','"+ data.device +"','"+ data.status +"', '" + data.user + "');";
		db.all(query, function(err, res){
			if(err){
				callback(err);
			}else{
				data.id = res.insertId;
				deviceFunctions.getDevice(data.device, function(device){
					data.device = device;
					callback("200", data);
				});
			}
		});
	}
}