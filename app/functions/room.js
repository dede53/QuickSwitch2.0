var db 				= require('./database.js');
var SwitchServer	= require('./SwitchServer.js');
var deviceFunctions	= require('./device.js');
var async 			= require("async");

function getRoom(id, callback){
	var query = "SELECT * FROM rooms WHERE id = "+ id +";";
	db.all(query, function(err, data){
		if(err){
			log.error(err);
		}else if(data == ""){
			log.info("Kein Raum mit der ID: " + id);
		}else{
			callback(data[0]);
		}
	});
}

module.exports = {
	switchRoom: function (room, status, app, callback){
		if(status == "toggle"){
			var query = "SELECT deviceid, status, devices.name, protocol, buttonLabelOff, buttonLabelOn, CodeOn, CodeOff, type, devices.roomid, rooms.name AS Raum, switchserver FROM devices, rooms WHERE devices.roomid = '" + room.id + "' AND devices.roomid = rooms.id AND devices.type = 'device' AND devices.showStatus = '1';";
		}else{
			var query = "SELECT deviceid, status, devices.name, protocol, buttonLabelOff, buttonLabelOn, CodeOn, CodeOff, type, devices.roomid, rooms.name AS Raum, switchserver FROM devices, rooms WHERE devices.roomid = '" + room.id + "' AND devices.status != '" + status + "' AND devices.roomid = rooms.id AND devices.type = 'device' AND devices.showStatus = '1';";
		}
		var switchTo = status;

		db.all(query , function(err, row) {
			if (err) {
				log.error("switchRoom: " + err);
				callback(404);
			} else {
				var callbackSend = false;
				row.forEach(function(device){
					if(status == "toggle"){
						if(device.status == "1"){
							switchTo = "0";
						}else{
							switchTo = "1";
						}
					}
					deviceFunctions.switchDevice(app, device.deviceid, switchTo, function(err){
						if(callbackSend === false){
							callback(err);
						}
					});
				});
			}
		});
	},
	getRooms: function (type, callback){
		if(type == "object"){
			var uff = new Object;
		}else{
			var uff = new Array;
		}
		var query = "SELECT * FROM rooms;";
		db.all(query, function(err, data){
			async.each(data,
				function(data, callback){
					if(err){
						log.error(err);
					}else{
						if(type == "object"){
							uff[data.id] = data;
						}else{
							uff.push(data);
						}
						callback();
					}
				},
				function(err){
					if(err){
						log.error(err);
					}else{
						callback(uff);
					}
				}
			);
		});
	},
	getRoom: getRoom,
	saveRoom: function(data, callback){
		if(data.id){
			var query = "UPDATE rooms SET name = '"+ data.name +"' WHERE id = '"+ data.id +"';";
			db.run(query);
			callback(201, data);
		}else{
			var query = "INSERT INTO rooms (name) VALUES ('" + data.name + "');";
			db.all(query, function(err, res){
				if (err) {
					console.log(err);
				}else{
					data.id = res.insertId;
					callback(201, data);
				}
			});
		}
	},
	deleteRoom: function (id, callback) {
		var query = "SELECT rooms.name AS Raum, devices.* FROM devices, rooms WHERE devices.roomid = '" + id + "'     AND    devices.roomid = rooms.id AND devices.type = 'device';";
		db.all(query, function(err, data){
			if(data.length > 0){
				callback(409);
			}else{
				var query = "DELETE FROM rooms WHERE id = "+ id +";";
				db.all(query ,function(err,rows){
					if(err){
						log.error(err);
						callback(err);
					}else{
						callback(200);
					}
				});
			}
		});
	}
}