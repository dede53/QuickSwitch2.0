var db 				= require('./database.js');
var deviceFunctions	= require('./device.js');
var SwitchServer	= require('./SwitchServer.js');
var async 			= require("async");
var helper 			= require('./helper.js');

function switchAction(dev, status, app, callback){
	switch(dev.type){
		case "device":
			deviceFunctions.switchDevice(app, dev.id, status, function(err){
				callback(err);
			});
			break;
		case "room":
			var room = {};
			room.id = dev.id;
			roomFunctions.switchRoom(room, status, app, function(err){
				callback(err);
			});
			break;
		default:
			helper.log.error("Falscher Gruppen type:" + dev.type);
			callback(404);	
			break;
	}
}
module.exports = {
	switchGroup: function(app, group, status, callback){
		var string = "";
		var callbackSend = false;
		group.groupDevices.forEach(function(dev){
			if(dev.timeout){
				setTimeout(function(){
					switchAction(dev, status, app, function(status){
						if(callbackSend === false){
							callback(status);
							callbackSend = true;
						}
					});
				},  parseInt(parseInt(dev.timeout) * 1000) );
			}else{
				switchAction(dev, status, app, function(status){
					if(callbackSend === false){
						callback(status);
						callbackSend = true;
					}
				});
			}
		});
	},
	getAllGroups: function(callback){
		var query = "SELECT id, name, devices as groupDevices, user FROM groups;";
		db.all(query, function(err, data){
			if(err){
				callback(404);
				helper.log.error(err);
			}else{
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
	getGroups: function(user, callback){
		var query = "SELECT id, name, devices as groupDevices, user FROM groups WHERE user = '" + user + "';";
		db.all(query, function(err, data){
			if(err){
				callback(404);
				helper.log.error(err);
			}else{
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
		var query = "SELECT id, name, devices as groupDevices, user FROM groups WHERE id = " + id + ";";
		db.all(query, function(err, data){
			if(err){
				helper.log.error(err);
				callback(404);
			}else if(data == ""){
				helper.log.info("Keine Gruppe mit der ID: " + id);
				callback(404);
			}else{
				var data = data[0];
				try{
					data.groupDevices = JSON.parse(data.groupDevices);
				}catch(e){
					console.log("Fehler beim parsen der Gruppe:");
					console.log(e);
					callback(404);
				}
				callback(data);
			}
		});
	},
	saveNewGroup: function(data, callback){
		var query = "INSERT INTO groups (name, devices, user) VALUES ('" + data.name + "', '"+ JSON.stringify(data.groupDevices) +"', '"+ data.user +"');";
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