var db 				= require('./database.js');
var SwitchServer	= require('./SwitchServer.js');
var async 			= require("async");
var helper 			= require('./helper.js');

module.exports = {
	switchGroup: function(app, group, status, req, res, callback){
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
		var query = "SELECT deviceid, status, devices.name, protocol, buttonLabelOff, buttonLabelOn, switchserver, CodeOn, CodeOff, type,devices.roomid, rooms.name AS Raum FROM devices, rooms WHERE rooms.id = devices.roomid AND ("+ string +") AND devices.type = 'device';";
		db.all(query , function(err, data) {
			if(err){
				helper.log.error(err);
				callback(404);
			}else{
				data.forEach(function(row){
					var device = {};
					device.type = row.type;
					device[row.type] = row;
					SwitchServer.sendto(app, req, status, device, function(status){
						if(status == 200){
						}
					});
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
				helper.log.error(err);
			}else{
				callback(data);
			}
		});
	},
	getGroup: function(id, req, res, callback){
		var query = "SELECT id, name, devices as groupDevices FROM groups WHERE id = " + id + ";";
		db.all(query, function(err, data){
			if(err){
				helper.log.error(err);
				callback(404);
			}else if(data == ""){
				helper.log.info("Keine Gruppe mit der ID: " + id);
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