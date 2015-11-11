var db 				= require('./database.js');
var SwitchServer	= require('./SwitchServer.js');
var async 			= require("async");

module.exports = {
	 switchGroup: function(app, group, status, req, res, callback) {
		var groupDevices = JSON.parse(group.groupDevices);
		var devices = new Object;
		var string = "";
		groupDevices.forEach(function(dev){
			if(string == ""){
				string = " deviceid = " + dev;
			}else{
				string = string + " OR  deviceid = " + dev;
			}
		});
		var query = "SELECT * FROM devices WHERE "+ string +";";
		db.all(query , function(err, data) {
			if(err){
				console.log(err);
				callback(404);
			}else{
				data.forEach(function(device){
					SwitchServer.sendto(app, req, status, device, function(data){
						console.log(data);
					});
					var query = "UPDATE devices SET status = '"+ status +"' WHERE deviceid = "+ device.deviceid +";";
					db.run(query);
				});
				callback(200);
			}
		});
	},
	getGroups: function(req, res, callback){
		var query = "SELECT id, name, devices as groupDevices FROM groups;";
		db.all(query, function(err, data){
			if(err){
				callback(404);
				console.log(err);
			}else{
				callback(data);
			}
		});
	},
	getGroup: function(id, req, res, callback){
		var query = "SELECT id, name, devices as groupDevices FROM groups WHERE id = " + id + ";";
		db.all(query, function(err, data){
			if(err){
				console.log(err);
				callback(404);
			}else if(data == ""){
				console.log("Keine Gruppe mit der ID: " + id);
				callback(404);
			}else{
				callback(data);
			}
		});
	},
	saveNewGroup: function(data, req, res, callback){
		var query = "INSERT INTO groups (name, devices) VALUES ('" + data.name + "', '["+ data.devices +"]');";
		db.run(query);
		callback(201);
	},
	saveEditGroup: function(data, req ,res, callback){
		console.log(data);
		var query = "UPDATE groups SET name = '" + data.name + "', devices = '["+ data.devices +"]' WHERE id = '" + data.id + "';";
		db.run(query);
		callback(201);
	},
	deleteGroup: function(id, req, res, callback){
		var query = "DELETE FROM groups WHERE id = '" + id + "';";
		db.all(query, function(err, data){
			if(err){
				callback(err);
			}else{
				callback("200");
			}
		});
	}
}