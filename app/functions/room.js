var db 				= require('./database.js');
var SwitchServer	= require('./SwitchServer.js');
var async 			= require("async");
var helper 			= require('./helper.js');

module.exports = {
	switchRoom: function (room, status, app, req, res, callback){
		var query = "SELECT deviceid, status, devices.name, protocol, buttonLabelOff, buttonLabelOn, CodeOn, CodeOff, type, devices.roomid, rooms.name AS Raum, switchserver FROM devices, rooms WHERE roomid = '" + room.id + "' AND devices.roomid = rooms.id AND status != " + status + " AND devices.type = 'device';";
		db.all(query , function(err, row) {
			if (err) {
				helper.log.error(err);
				callback(404);
			} else {
				row.forEach(function(preDevice){
					var device = {};
					device.type = preDevice.type;
					device[preDevice.type] = preDevice;
					// console.log(device);
					SwitchServer.sendto(app, req, status, device, function(status){
						if(status == 200){
						}
					});
				});
				callback(200);
			}
		});
	},
	getRooms: function (type, req,res, callback){
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
	getRoom: function (id, req, res, callback){
		var query = "SELECT * FROM rooms WHERE id = "+ id +";";
		db.all(query, function(err, data){
			if(err){
				helper.log.error(err);
			}else if(data == ""){
				helper.log.info("Kein Raum mit der ID: " + id);
			}else{
				callback(data);
			}
		});
	},
	saveNewRoom: function (data, req, res, callback) {
		var query = "INSERT INTO rooms ( name) VALUES ('"+ data.name +"');";
		db.run(query);
		callback(201);
	},
	saveEditRoom: function (data, req, res, callback) {
		var query = "UPDATE rooms SET name = '"+ data.name +"' WHERE id = '"+ data.id +"';";
		db.run(query);
		callback(201);
	},
	deleteRoom: function (id, req, res, callback) {
		var query = "DELETE FROM rooms WHERE id = "+ id +";";
		db.all(query ,function(err,rows){
			if(err){
				helper.log.error(err);
				callback('Error: ' + err);
			}else{
				callback("200");
			}
		});
	}
}