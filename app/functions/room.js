var db 				= require('./database.js');
var SwitchServer	= require('./SwitchServer.js');
var async 			= require("async");
var helper 			= require('./helper.js');

module.exports = {
<<<<<<< HEAD
	switchRoom: function (room, status, app, callback){
		var query = "SELECT deviceid, status, devices.name, protocol, buttonLabelOff, buttonLabelOn, CodeOn, CodeOff, type, devices.roomid, rooms.name AS Raum, switchserver FROM devices, rooms WHERE roomid = '" + room.id + "' AND devices.roomid = rooms.id AND status != " + status + " AND devices.type = 'device' AND devices.showStatus = '1';";
=======
	switchRoom: function (room, status, app, req, res, callback){
		var query = "SELECT deviceid, status, devices.name, protocol, buttonLabelOff, buttonLabelOn, CodeOn, CodeOff, type, devices.roomid, rooms.name AS Raum, switchserver FROM devices, rooms WHERE roomid = '" + room.id + "' AND devices.roomid = rooms.id AND status != " + status + " AND devices.type = 'device';";
>>>>>>> d3e70a1d720f830c1b7fd87dccb9dd8e639e7874
		db.all(query , function(err, row) {
			if (err) {
				helper.log.error(err);
				callback(404);
			} else {
<<<<<<< HEAD
				row.forEach(function(device){
					SwitchServer.sendto(app, status, device, function(status){
=======
				row.forEach(function(preDevice){
					var device = {};
					device.type = preDevice.type;
					device[preDevice.type] = preDevice;
					// console.log(device);
					SwitchServer.sendto(app, req, status, device, function(status){
>>>>>>> d3e70a1d720f830c1b7fd87dccb9dd8e639e7874
						if(status == 200){
						}
					});
				});
				callback(200);
			}
		});
	},
<<<<<<< HEAD
	getRooms: function (type, callback){
=======
	getRooms: function (type, req,res, callback){
>>>>>>> d3e70a1d720f830c1b7fd87dccb9dd8e639e7874
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
<<<<<<< HEAD
	getRoom: function (id, callback){
=======
	getRoom: function (id, req, res, callback){
>>>>>>> d3e70a1d720f830c1b7fd87dccb9dd8e639e7874
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
<<<<<<< HEAD
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
=======
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
>>>>>>> d3e70a1d720f830c1b7fd87dccb9dd8e639e7874
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