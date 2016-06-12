var db 				= require('./database.js');
var async 			= require("async");
var deviceFunctions = require('./device.js');
var helper 			= require('./helper.js');

module.exports = {
	/*****************************************
	* Liefert alle Countdowns
	*****************************************/
	getCountdowns: function(req,res,callback){
		var query = "SELECT countdowns.id, countdowntypen.type, countdowns.switchid, countdowns.time, countdowns.status AS switchstatus FROM countdowns, countdowntypen WHERE countdowns.type = countdowntypen.id;";
		db.all(query, function(err, row){
			if(err){
				helper.log.error(err, "error");
			}else{
				var bla = new Array;
				async.each(row,
					function(row, callback){
						deviceFunctions.getDevice(row.switchid, req, res, function(device){
							row.device = device;
							bla.push(row);
							callback();
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
	deleteCountdown: function(id, req, res, callback) {
		var query = "SELECT * FROM countdowns WHERE id = " + id + ";";
		db.all(query , function(err, row) {
			if (err) {
				helper.log.error(err, "error");
				callback('Error: ' + err);
			}else if (row == "") {
				callback("300");
				helper.log.error("Kein Countdown mit der ID: " + id, "debug");
			} else {
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
		var query = "INSERT INTO countdowns (type, time, switchid, status) VALUES ('1','"+ data.time +"','"+ data.device +"','"+ data.switchstatus +"');";
		db.all(query, function(err, data){
			if(err){
				callback(err);
			}else{
				callback("200");
			}
		});
	}
}