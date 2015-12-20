var db 				= require('./database.js');
var SwitchServer	= require('./SwitchServer.js');
var async 			= require("async");

module.exports = {
	switchRoom: function (room, status, req, res, callback){
		var query = "SELECT deviceid, status, devices.name, protocol, buttonLabelOff, buttonLabelOn, CodeOn, CodeOff,devices.roomid, rooms.name AS Raum FROM devices, rooms WHERE roomid = '" + room.id + "' AND devices.roomid = rooms.id;";
		db.all(query , function(err, row) {
			if (err) {
				console.log(err);
				callback(404);
			} else {
				row.forEach(function(device){
					SwitchServer.sendto(app, req, status, device, function(data){
						console.log(data);
					});
				});
				var query = "UPDATE devices SET status = '"+ status +"' WHERE roomid = "+ room.id +";";
				db.run(query);
				callback(200);
			}
		});
	},
	getRooms: function (req,res, callback){
		var query = "SELECT * FROM rooms;";
		db.all(query, function(err, data){
			if(err){
				console.log(err);
			}else{
				callback(data);
			}
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