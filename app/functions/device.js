var db 				= require('./database.js');
var SwitchServer	= require('./SwitchServer.js');
var async 			= require("async");

module.exports = {
	getDevices: function (type, req, res, callback) {
		var query = "SELECT * FROM rooms;";
		if(type == "object"){
			var uff = new Object;
		}else{
			var uff = new Array;
		}
		db.all(query, function(err, row){
			if(err){
				console.log(err);
				callback(404);
			}else{
				async.each(row,
					function(row, callback){
						var query = "SELECT rooms.name AS Raum, devices.* FROM devices, rooms WHERE devices.roomid = '" + row.id + "'     AND    devices.roomid = rooms.id;";
						db.all(query , function(err, data) {
							if(err){
								console.log(err);
							}else{
								if(type == "object"){
									uff[row.name] = new Object;
									data.forEach(function(dat){
										uff[row.name][dat.deviceid] = dat;								
									});
								}else{
									// uff[row.name] = new Array;
									data.forEach(function(dat){
										uff.push(dat);							
									});
									
								}
								callback();
							}
						});
					},
					function(err){
						if(err){
							console.log(err);
						}else{
							callback(uff);
						}
					}
				);
			}
		});
	},
	getDevice: function (id, req, res, callback) {
		var query = "SELECT devices.*, rooms.name AS Raum FROM devices, rooms WHERE devices.roomid = rooms.id AND devices.deviceid = " + id + ";";
		db.all(query , function(err, row) {
			if (err) {
				console.log(err);
				callback(404);
			}else if(row == ""){
				callback("Kein Gerät mit der ID " + id);
			}else{
				callback(row[0]);
			}
		});
	},
	saveNewDevice: function (data, req, res, callback) {
		var query = "INSERT INTO devices ( name, protocol, buttonLabelOn, buttonLabelOff, CodeOn, CodeOff, roomid, switchserver ) VALUES ('"+ data.name +"', '"+ data.protocol +"', '"+ data.buttonLabelOn +"', '"+ data.buttonLabelOff +"', '"+ data.CodeOn +"', '"+ data.CodeOff +"', '"+ data.room +"', '" + data.switchserver + "');";
		db.run(query);
		callback(201);
	},
	saveEditDevice: function (data, req, res, callback) {
		var query = "UPDATE devices SET name = '"+ data.name +"', protocol = '"+ data.protocol +"', buttonLabelOn = '"+ data.buttonLabelOn +"', buttonLabelOff = '"+ data.buttonLabelOff +"', CodeOn = '"+ data.CodeOn +"', CodeOff = '"+ data.CodeOff +"', roomid = '"+ data.room +"', switchserver = '" + data.switchserver + "' WHERE deviceid = '"+ data.deviceid +"';";
		db.run(query);
		callback(201);
	},
	deleteDevice: function (id, req, res, callback) {
		var query = "SELECT * FROM devices WHERE deviceid = " + id + ";";
		db.all(query , function(err, row) {
			if (err) {
				console.log('Error: ' + err);
				callback('Error: ' + err);
			}else if (row == "") {
				callback("300");
				console.log("Kein Gerät mit der ID");
			} else {
				var query = "DELETE FROM devices WHERE deviceid = "+ id +";";
				db.all(query ,function(err,rows){
					if(err){
						console.log('Error: ' + err);
						callback('Error: ' + err);
					}else{
						console.log('Delete switch with id: ' + id);
						callback("200");
					}
				});
			}
		});
	},
	switchDevice: function (app, id, status, req, res, callback) {
		var query = "SELECT deviceid, status, devices.name, protocol, buttonLabelOff, buttonLabelOn, switchserver, CodeOn, CodeOff,devices.roomid, rooms.name AS Raum FROM devices, rooms WHERE deviceid = '" + id + "' AND devices.roomid = rooms.id;";
		db.all(query , function(err, row) {
			if (err) {
				console.log(err);
				callback(404);
			} else {
				SwitchServer.sendto(app, req, status, row[0],function(status){
					if(status == 200){
						SwitchServer.sendActiveDevices(app, db, function(err){
							if(err != 200){
								console.log("Error: Liste der aktiven Geräte konnte nicht gesendet werden" + err);
							}
						});
					}
				});
				var query = "UPDATE devices SET status = '"+ status +"' WHERE deviceid = "+ id +";";
				db.run(query);
				callback(200);
			}
		});
	},
	switchDevices: function (app, status, req, res, callback) {
		var query = "SELECT deviceid, status, devices.name, protocol, buttonLabelOff, buttonLabelOn, switchserver, CodeOn, CodeOff,devices.roomid, rooms.name AS Raum FROM devices, rooms WHERE devices.roomid = rooms.id AND status != " + status + ";";
		db.all(query , function(err, row) {
			if (err) {
				log(err, "error");
				callback(404);
			} else {
				row.forEach(function(device){
					SwitchServer.sendto(app, req, status, device,function(status){
						if(status == 200){
							SwitchServer.sendActiveDevices(app, db, function(err){
								if(err != 200){
									console.log("Error: Liste der aktiven Geräte konnte nicht gesendet werden" + err);
								}
							});
						}
					});
					var query = "UPDATE devices SET status = '"+ status +"' WHERE deviceid = "+ device.deviceid +";";
					db.run(query);
				});
				callback(200);
			}
		});
	},
	favoritDevices: function (data, req, res, callback){
		var favoritDevices = JSON.parse(data.favoritDevices);
		// console.log(favoritDevices);
		if(favoritDevices == ""){
			console.log("Keine Geräte gewählt!");
		}else{
			var devices = new Object;
			var string = "";
			favoritDevices.forEach(function(dev){
				if(string == ""){
					string = " deviceid = " + dev;
				}else{
					string = string + " OR  deviceid = " + dev;
				}
			});
			var query = "SELECT devices.*, rooms.name AS room FROM devices, rooms WHERE devices.roomid = rooms.id AND ("+ string +");";
			db.all(query , function(err, data) {
				if(err){
					console.log(err);
				}else{
					data.forEach(function(device){
						devices[device.deviceid] = device;
					});
					callback(devices);
				}
			});
		}
	}
}