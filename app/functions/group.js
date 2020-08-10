var db 				= require('./database.js');
var deviceFunctions	= require('./device.js');
var roomFunctions	= require('./room.js');
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
			log.error("Falscher Gruppen type:" + dev.type);
			callback(404);	
			break;
	}
}
var getGroups = function(user, callback){
	var query = "SELECT id, name, devices as groupDevices, user FROM SmartHome.groups WHERE user = '" + user + "';";
	db.all(query, function(err, data){
		if(err){
			callback(404);
			log.error(err);
		}else{
			var groups = {};
			data.forEach(function(group){
				try{
					group.groupDevices = JSON.parse(group.groupDevices);
				}catch(e){
					log.error("Fehler beim parsen der Gruppe:");
					log.error(e);
				}
				groups[group.id] = group;
			});
			callback(groups);
		}
	});
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
		var query = "SELECT id, name, devices as groupDevices, user FROM SmartHome.groups;";
		db.all(query, function(err, data){
			if(err){
				callback(404);
				log.error(err);
			}else{
				var groups = {};
				data.forEach(function(group){
					try{
						group.groupDevices = JSON.parse(group.groupDevices);
					}catch(e){
						log.error("Fehler beim parsen der Gruppe:");
						log.error(e);
					}
					groups[group.id] = group;
				});
				callback(groups);
			}
		});
	},
	getGroup: function(id, callback){
		var query = "SELECT id, name, devices as groupDevices, user FROM SmartHome.groups WHERE id = " + id + ";";
		db.all(query, function(err, data){
			if(err){
				log.error(err);
				callback(404);
			}else if(data == ""){
				log.info("Keine Gruppe mit der ID: " + id);
				callback(404);
			}else{
				var data = data[0];
				try{
					data.groupDevices = JSON.parse(data.groupDevices);
				}catch(e){
					log.error("Fehler beim parsen der Gruppe:");
					log.error(e);
					callback(404);
				}
				callback(data);
			}
		});
	},
	saveGroup: function(data, callback){
		if(data.id){
			var query = "UPDATE SmartHome.groups SET name = '" + data.name + "', devices = '"+ JSON.stringify(data.groupDevices) +"', user = '"+ data.user +"' WHERE id = '" + data.id + "';";
		}else{
			var query = "INSERT INTO SmartHome.groups (name, devices, user) VALUES ('" + data.name + "', '"+ JSON.stringify(data.groupDevices) +"', '"+ data.user +"');";
		}
		db.run(query);
		getGroups(data.user, function(groups){
			callback(groups);
		});
	},
	deleteGroup: function(id, callback){
		var query = "DELETE FROM SmartHome.groups WHERE id = '" + id + "';";
		db.all(query, function(err, data){
			if(err){
				callback(err);
			}else{
				callback("200");
			}
		});
	},
	getGroups: getGroups
}