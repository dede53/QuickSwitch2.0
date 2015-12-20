<<<<<<< HEAD
var db 				= require('./database.js');
var async 			= require("async");
var deviceFunctions = require('./device.js');

module.exports = {
	/*****************************************
	* Liefert alle Countdowns
	*****************************************/
	getCountdowns: function(req,res,callback){
		var query = "SELECT countdowns.id, countdowntypen.type, countdowns.switchid, countdowns.time, countdowns.status AS switchstatus FROM countdowns, countdowntypen WHERE countdowns.type = countdowntypen.id;";
		db.all(query, function(err, row){
			if(err){
				console.log(err);
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
							console.log(err);
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
		console.log(id);
		var query = "SELECT * FROM countdowns WHERE id = " + id + ";";
		db.all(query , function(err, row) {
			if (err) {
				console.log('Error: ' + err);
				callback('Error: ' + err);
			}else if (row == "") {
				callback("300");
				console.log("Kein Countdown mit der ID");
			} else {
				var query = "DELETE FROM countdowns WHERE id = "+ id +";";
				db.all(query ,function(err,rows){
					if(err){
						console.log('Error: ' + err);
						callback('Error: ' + err);
					}else{
						console.log('Delete Countdown with id: ' + id);
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
		console.log(data.device);
		var query = "INSERT INTO countdowns (type, time, switchid, status) VALUES ('1','"+ data.time +"','"+ data.device +"','"+ data.switchstatus +"');";
		console.log(query);
		db.all(query, function(err, data){
			if(err){
				callback(err);
			}else{
				callback("200");
			}
		});
	}
=======
var db 				= require('./database.js');
var async 			= require("async");

module.exports = {
	/*****************************************
	* Liefert alle Countdowns
	*****************************************/
	getCountdowns: function(req,res,callback){
		var query = "SELECT countdowns.id, countdowntypen.type, countdowns.switchid, countdowns.time, countdowns.status AS switchstatus FROM countdowns, countdowntypen;";
		db.all(query, function(err, row){
			if(err){
				console.log(err);
			}else{
				var bla = new Array;
				async.each(row,
					function(row, callback){
						getDevice(row.switchid, req, res, function(device){
							row.device = device;
							bla.push(row);
							callback();
						});
					},
					function(err){
						if(err){
							console.log(err);
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
				console.log('Error: ' + err);
				callback('Error: ' + err);
			}else if (row == "") {
				callback("300");
				console.log("Kein Countdown mit der ID");
			} else {
				var query = "DELETE FROM countdowns WHERE id = "+ id +";";
				db.all(query ,function(err,rows){
					if(err){
						console.log('Error: ' + err);
						callback('Error: ' + err);
					}else{
						console.log('Delete Countdown with id: ' + id);
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
		var query = "INSERT INTO countdowns (type, time, switchid, status) VALUES ('1','"+ data.time +"','"+ data.device.deviceid +"','"+ data.switchstatus +"');";
		db.all(query, function(err, data){
			if(err){
				callback(err);
			}else{
				callback("200");
			}
		});
	}
>>>>>>> af97e501eae31491992417dd0f792413c9d64b8f
}