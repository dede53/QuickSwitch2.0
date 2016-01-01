var db 				= require('./database.js');
var SwitchServer	= require('./SwitchServer.js');
var async 			= require("async");

module.exports = {
	switchRoom: function (room, status, app, req, res, callback){
		var query = "SELECT deviceid, status, devices.name, protocol, buttonLabelOff, buttonLabelOn, CodeOn, CodeOff,devices.roomid, rooms.name AS Raum, switchserver FROM devices, rooms WHERE roomid = '" + room.id + "' AND devices.roomid = rooms.id;";
		db.all(query , function(err, row) {
			if (err) {
				console.log(err);
				callback(404);
			} else {
				row.forEach(function(device){
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
							console.log(err);
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
							console.log(err);
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
				console.log(err);
			}else if(data == ""){
				console.log("Kein Raum mit der ID: " + id);
			}else{
				callback(data);
			}
		});
	},
	saveNewRoom: function (data, req, res, callback) {
		var query = "INSERT INTO rooms ( name) VALUES ('"+ data.name +"');";
		console.log(query);
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
				console.log('Error: ' + err);
				callback('Error: ' + err);
			}else{
				callback("200");
			}
		});
	}
}