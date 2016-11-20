var db 				= require('./database.js');
var deviceFunctions	= require('./device.js');
var SwitchServer	= require('./SwitchServer.js');
var async 			= require("async");
var helper 			= require('./helper.js');

<<<<<<< HEAD
function switchAction(dev, status, app){
	switch(dev.type){
		case "device":
			deviceFunctions.switchDevice(app, dev.id, status, function(err){
=======
function switchAction(dev, status, app, req, res){
	switch(dev.type){
		case "device":
			deviceFunctions.switchDevice(app, dev.id, status, res, res, function(err){
>>>>>>> d3e70a1d720f830c1b7fd87dccb9dd8e639e7874
				if(err != 200){
					helper.log.error("Raum konnte nicht geschaltet werden");
				}});
			break;
		case "room":
			var room = {};
			room.id = dev.id;
<<<<<<< HEAD
			roomFunctions.switchRoom(room, status, app, function(err){
=======
			roomFunctions.switchRoom(room, status, app, req, res, function(err){
>>>>>>> d3e70a1d720f830c1b7fd87dccb9dd8e639e7874
				if(err != 200){
					helper.log.error("Raum konnte nicht geschaltet werden");
				}
			});
			break;
		default:
			helper.log.error("Falscher Gruppen type:" + dev.type);	
			break;
	}
}
module.exports = {
<<<<<<< HEAD
	switchGroup: function(app, group, status, callback){
		var string = "";
		group.groupDevices.forEach(function(dev){
			if(dev.timeout){
				setTimeout(function(){
					switchAction(dev, status, app);
				},  parseInt(parseInt(dev.timeout) * 1000) );
			}else{
				switchAction(dev, status, app);
			}
		});
	},
	getGroups: function(user, callback){
		var query = "SELECT id, name, devices as groupDevices, user FROM groups WHERE user = '" + user + "';";
=======
	switchGroup: function(app, group, status, req, res, callback){
		var groupDevices = JSON.parse(group.groupDevices);
		var string = "";
		groupDevices.forEach(function(dev){
			if(dev.timeout){
				setTimeout(function(){
					switchAction(dev, status, app, req, res);
				}, ( parseInt(dev.timeout) * 1000) );
			}else{
				switchAction(dev, status, app, req, res);
			}
		});
	},
	switchGroupOrg: function(app, group, status, req, res, callback){
		var groupDevices = JSON.parse(group.groupDevices);
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
>>>>>>> d3e70a1d720f830c1b7fd87dccb9dd8e639e7874
		db.all(query, function(err, data){
			if(err){
				callback(404);
				helper.log.error(err);
			}else{
<<<<<<< HEAD
				var groups = {};
				data.forEach(function(group){
					try{
						group.groupDevices = JSON.parse(group.groupDevices);
					}catch(e){
						console.log("Fehler beim parsen der Gruppe:");
						console.log(e);
					}
					groups[group.id] = group;
				});
				callback(groups);
			}
		});
	},
	getGroup: function(id, callback){
=======
				callback(data);
			}
		});
	},
	getGroup: function(id, req, res, callback){
>>>>>>> d3e70a1d720f830c1b7fd87dccb9dd8e639e7874
		var query = "SELECT id, name, devices as groupDevices FROM groups WHERE id = " + id + ";";
		db.all(query, function(err, data){
			if(err){
				helper.log.error(err);
				callback(404);
			}else if(data == ""){
				helper.log.info("Keine Gruppe mit der ID: " + id);
				callback(404);
			}else{
<<<<<<< HEAD
				try{
					data.groupDevices = JSON.parse(data.groupDevices);
				}catch(e){
					console.log("Fehler beim parsen der Gruppe:");
					console.log(e);
				}
=======
>>>>>>> d3e70a1d720f830c1b7fd87dccb9dd8e639e7874
				callback(data);
			}
		});
	},
<<<<<<< HEAD
	saveNewGroup: function(data, callback){
		var query = "INSERT INTO groups (name, devices) VALUES ('" + data.name + "', '["+ data.devices +"]');";
		db.all(query, function(err, res){
			if(!err){
				data.id = res.insertId;
				callback(201, data);
			}
		});
	},
	saveEditGroup: function(data, callback){
		var query = "UPDATE groups SET name = '" + data.name + "', devices = '["+ data.devices +"]' WHERE id = '" + data.id + "';";
		db.run(query);
		callback(201, data);
	},
	deleteGroup: function(id, callback){
=======
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
>>>>>>> d3e70a1d720f830c1b7fd87dccb9dd8e639e7874
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