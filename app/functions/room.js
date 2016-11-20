var db 				= require('./database.js');
var SwitchServer	= require('./SwitchServer.js');
var async 			= require("async");
var helper 			= require('./helper.js');

module.exports = {
	switchRoom: function (room, status, app, callback){
		var query = "SELECT deviceid, status, devices.name, protocol, buttonLabelOff, buttonLabelOn, CodeOn, CodeOff, type, devices.roomid, rooms.name AS Raum, switchserver FROM devices, rooms WHERE roomid = '" + room.id + "' AND devices.roomid = rooms.id AND status != " + status + " AND devices.type = 'device' AND devices.showStatus = '1';";
		db.all(query , function(err, row) {
			if (err) {
				helper.log.error(err);
				callback(404);
			} else {
				row.forEach(function(device){
					SwitchServer.sendto(app, status, device, function(status){
						if(status == 200){
						}
					});
				});
				callback(200);
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
	getRoom: function (id, callback){
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
	saveNewRoom: function (data, callback) {
		var query = "INSERT INTO rooms ( name) VALUES ('"+ data.name +"');";
		db.all(query, function(err, res){
			if (!err) {
				data.id = res.insertId;
				callback(201, data);
			}
		});
	},
	saveEditRoom: function (data, callback) {
		var query = "UPDATE rooms SET name = '"+ data.name +"' WHERE id = '"+ data.id +"';";
		db.run(query);
		callback(201, data);
	},
	deleteRoom: function (id, callback) {
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