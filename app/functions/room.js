var db 				= require('./database.js');
var SwitchServer	= require('./SwitchServer.js');
var async 			= require("async");
var helper 			= require('./helper.js');

function getRoom(id, callback){
	var query = "SELECT * FROM rooms WHERE id = "+ id +";";
	db.all(query, function(err, data){
		if(err){
			helper.log.error(err);
		}else if(data == ""){
			helper.log.info("Kein Raum mit der ID: " + id);
		}else{
			callback(data[0]);
		}
	});
}

module.exports = {
	switchRoom: function (room, status, app, callback){
		if(status == 'toggle'){
			var query = "SELECT deviceid, status, devices.name, protocol, buttonLabelOff, buttonLabelOn, CodeOn, CodeOff, type, devices.roomid, rooms.name AS Raum, switchserver FROM devices, rooms WHERE devices.roomid = '" + room.id + "' AND devices.roomid = rooms.id AND devices.type = 'device' AND devices.showStatus = '1';";
		}else{
			var query = "SELECT deviceid, status, devices.name, protocol, buttonLabelOff, buttonLabelOn, CodeOn, CodeOff, type, devices.roomid, rooms.name AS Raum, switchserver FROM devices, rooms WHERE devices.roomid = '" + room.id + "' AND devices.roomid = rooms.id AND status != " + status + " AND devices.type = 'device' AND devices.showStatus = '1';";
		}

		db.all(query , function(err, row) {
			if (err) {
				helper.log.error("switchRoom: " + err);
				callback(404);
			} else {
				var callbackSend = false;
				row.forEach(function(device){
					SwitchServer.sendto(app, status, device, function(status){
						if(callbackSend === false){
							callback(200);
							callbackSend = true;
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
						helper.log.error(err);
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
						helper.log.error(err);
					}else{
						callback(uff);
					}
				}
			);
		});
	},
	getRoom: getRoom,
	saveRoom: function(data, callback){
		console.log(data);
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
						helper.log.error(err);
						callback(err);
					}else{
						callback(200);
					}
				});
			}
		});
	}
}