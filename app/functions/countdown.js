var db 				= require('./database.js');
var async 			= require("async");
var deviceFunctions = require('./device.js');
var helper 			= require('./helper.js');

module.exports = {
	/*****************************************
	* Liefert alle Countdowns
	*****************************************/
<<<<<<< HEAD
	getCountdowns: function(user, callback){
		var query = "SELECT countdowns.id, countdowntypen.type, countdowns.switchid, countdowns.time, countdowns.status FROM countdowns, countdowntypen WHERE countdowns.type = countdowntypen.id AND countdowns.user = '"+ user +"';";
=======
	getCountdowns: function(req,res,callback){
		var query = "SELECT countdowns.id, countdowntypen.type, countdowns.switchid, countdowns.time, countdowns.status AS switchstatus FROM countdowns, countdowntypen WHERE countdowns.type = countdowntypen.id;";
>>>>>>> d3e70a1d720f830c1b7fd87dccb9dd8e639e7874
		db.all(query, function(err, row){
			if(err){
				helper.log.error(err, "error");
			}else{
<<<<<<< HEAD
				var bla = {};
				async.each(row,
					function(row, callback){
						deviceFunctions.getDevice(row.switchid, function(device){
							row.device = device;
							bla[row.id] = row;
							callback()
=======
				var bla = new Array;
				async.each(row,
					function(row, callback){
						deviceFunctions.getDevice(row.switchid, req, res, function(device){
							row.device = device;
							bla.push(row);
							callback();
>>>>>>> d3e70a1d720f830c1b7fd87dccb9dd8e639e7874
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
<<<<<<< HEAD
	deleteCountdown: function(id, callback) {
		var query = "DELETE FROM countdowns WHERE id = "+ id +";";
		db.all(query ,function(err,rows){
			if(err){
				helper.log.error(err, "error");
				callback('Error: ' + err);
			}else{
				helper.log.info('Delete Countdown with id: ' + id, "info");
				callback("200");
=======
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
>>>>>>> d3e70a1d720f830c1b7fd87dccb9dd8e639e7874
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
<<<<<<< HEAD
		var query = "INSERT INTO countdowns (type, time, switchid, status, user) VALUES ('1','"+ data.time +"','"+ data.device +"','"+ data.status +"', '" + data.user + "');";
		db.all(query, function(err, res){
			console.log(data);
			if(err){
				callback(err);
			}else{
				data.id = res.insertId;
				deviceFunctions.getDevice(data.device, function(device){
					data.device = device;
					callback("200", data);
				});
=======
		var query = "INSERT INTO countdowns (type, time, switchid, status) VALUES ('1','"+ data.time +"','"+ data.device +"','"+ data.switchstatus +"');";
		db.all(query, function(err, data){
			if(err){
				callback(err);
			}else{
				callback("200");
>>>>>>> d3e70a1d720f830c1b7fd87dccb9dd8e639e7874
			}
		});
	}
}