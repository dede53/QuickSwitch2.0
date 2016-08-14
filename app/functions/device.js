var db 				= require('./database.js');
var SwitchServer	= require('./SwitchServer.js');
var async 			= require("async");
var helper 			= require('./helper.js');

module.exports = {
	getDevices: function(type, req, res, callback){
		if(type == "object"){
			var uff = new Object;
		}else{
			var uff = new Array;
		}
		var query = "SELECT * FROM rooms;";
		db.all(query, function(err, row){
			if(err){
				helper.log.error(err);
				callback(404);
			}else{
				async.each(row,
					function(row, callback){
						var query = "SELECT rooms.name AS Raum, devices.* FROM devices, rooms WHERE devices.roomid = '" + row.id + "'     AND    devices.roomid = rooms.id AND devices.type = 'device';";
						db.all(query , function(err, data) {
							if(err){
								helper.log.error(err);
							}else{
								if(type == "object"){
									var bla = new Object;
									bla.room = row;

									bla.roomdevices = new Object;
									data.forEach(function(dat){
										var device = {};
										device.type = dat.type;
										device[dat.type] = dat;
										bla.roomdevices[dat.deviceid] = device;								
									});

									uff[row.name] = bla;
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
							helper.log.error(err);
						}else{
							callback(uff);
						}
					}
				);
			}
		});		
	},
	getDevice: function(id, req, res, callback){
		var query = "SELECT devices.*, rooms.name AS Raum FROM devices, rooms WHERE devices.roomid = rooms.id AND devices.deviceid = " + id + ";";
		db.all(query , function(err, row) {
			if (err) {
				helper.log.error(err);
				callback(404);
			}else if(row == ""){
				callback("Kein Gerät mit der ID " + id);
			}else{
				var device = {};
				device.type = row[0].type;
				device[row[0].type] = row[0];
				callback(device);
			}
		});		
	},
	saveNewDevice: function (data, req, res, callback) {
		console.log("Speichere eine neues Gerät");
		var data = data[data.type];
		var query = "INSERT INTO devices ( name, protocol, buttonLabelOn, buttonLabelOff, CodeOn, CodeOff, roomid, switchserver ) VALUES ('"+ data.name +"', '"+ data.protocol +"', '"+ data.buttonLabelOn +"', '"+ data.buttonLabelOff +"', '"+ data.CodeOn +"', '"+ data.CodeOff +"', '"+ data.room +"', '" + data.switchserver + "');";
		db.run(query);
		callback(201);
	},
	saveEditDevice: function (data, req, res, callback) {
		console.log("Speichere eine bearbeitetes Gerät");
		var query = "UPDATE devices SET name = '"+ data.name +"', protocol = '"+ data.protocol +"', buttonLabelOn = '"+ data.buttonLabelOn +"', buttonLabelOff = '"+ data.buttonLabelOff +"', CodeOn = '"+ data.CodeOn +"', CodeOff = '"+ data.CodeOff +"', roomid = '"+ data.room +"', switchserver = '" + data.switchserver + "' WHERE deviceid = '"+ data.deviceid +"';";
		db.run(query);
		callback(201);
	},
	deleteDevice: function (id, req, res, callback) {
		var query = "SELECT * FROM devices WHERE deviceid = " + id + ";";
		db.all(query , function(err, row) {
			if (err) {
				helper.log.error(err);
				callback('Error: ' + err);
			}else if (row == "") {
				callback("300");
				helper.log.info("Kein Gerät mit der ID");
			} else {
				var query = "DELETE FROM devices WHERE deviceid = "+ id +";";
				db.all(query ,function(err,rows){
					if(err){
						helper.log.error(err);
						callback(err);
					}else{
						helper.log.info('Delete switch with id: ' + id);
						callback("200");
					}
				});
			}
		});
	},
	switchDevice: function (app, id, status, req, res, callback) {
		var query = "SELECT deviceid, status, devices.name, protocol, buttonLabelOff, buttonLabelOn, switchserver, CodeOn, CodeOff, type, showStatus, devices.roomid, rooms.name AS Raum FROM devices, rooms WHERE deviceid = '" + id + "' AND devices.roomid = rooms.id;";
		db.all(query , function(err, row) {
			if (err) {
				helper.log.error(err);
				callback(404);
			}else if(row == ""){
				callback("Kein Gerät mit der ID " + id);
			}else{
				var device = {};
				device.type = row[0].type;
				device[row[0].type] = row[0];
				SwitchServer.sendto(app, req, status, device ,function(status){
					if(status == 200){
					}
				});
				callback(200);
			}
		});
	},
	switchDevices: function (app, status, req, res, callback) {
		var query = "SELECT deviceid, status, devices.name, protocol, buttonLabelOff, buttonLabelOn, switchserver, CodeOn, CodeOff, type , showStatus, devices.roomid, rooms.name AS Raum FROM devices, rooms WHERE devices.roomid = rooms.id AND status != " + status + " AND devices.type = 'device' AND devices.showStatus = '1';";
		db.all(query , function(err, row) {
			if (err) {
				helper.log.error(err);
				callback(404);
			} else {
				row.forEach(function(dev){
					var device = {};
					device.type = dev.type;
					device[dev.type] = dev;
					SwitchServer.sendto(app, req, status, device,function(status){
					});
				});
				callback(200);
			}
		});
	},
	favoritDevices: function (data, req, res, callback){
		if(data.favoritDevices == false || data.favoritDevices.length == 0){
			helper.log.info("Keine Geräte gewählt!");
			callback(false);
		}else{
			var favorits	= new Array;
			var bla 		= new Object;
			var query 		= "SELECT rooms.name AS Raum, devices.* FROM devices, rooms WHERE devices.roomid = rooms.id AND devices.type = 'device';";
			db.all(query , function(err, users) {
				if(err){
					helper.log.error(err);
				}else{
					users.forEach(function(dat){
						var device = {};
						device.type = dat.type;
						device[dat.type] = dat;
						bla[dat.deviceid] = device;								
					});
					data.favoritDevices.forEach(function(deviceid){
						favorits.push(bla[deviceid]);
					});
					callback(favorits);
				}
			});
		}
	},
	getSwitchHistory: function(hours, callback){
		var query = "SELECT * FROM `switch_history` WHERE time > '" + new Date(new Date().getTime() - (hours * 60000 * 60)).getTime() + "';";
		console.log(query);
		db.all(query, function(err, data){
			if(err){
				console.log(err);
			}else{
				callback(data);
			}
		});
	},
	getSwitchHistoryByID: function(hours, callback){
		var query = "SELECT * FROM `switch_history` WHERE time > '" + new Date(new Date().getTime() - (hours * 60000 * 60)).getTime() + "' GROUP BY deviceid;";
		console.log(query);
		db.all(query, function(err, data){
			if(err){
				console.log(err);
			}else{
				data.forEach(function(device){
					var query = "SELECT * FROM `switch_history` WHERE time > '" + new Date(new Date().getTime() - (hours * 60000 * 60)).getTime() + "' AND deviceid = '" + device.deviceid + "';";
					db.all(query, function(err, history){
						if(err){
							console.log(err);
						}else{
							var sortedData = [];
							history.forEach(function(dat){
								var value= [];
								value[0] = Math.floor(dat.time);

								dat.status = parseFloat(dat.status);
								if(dat.status == 0){
									sortedData.push([
										Math.floor(dat.time - 10),
										parseFloat(device.deviceid)
									]);
									value[1] = null;
								}else{
									value[1] = parseFloat(device.deviceid);
								}
								sortedData.push(value);
								
							});
							if(sortedData[sortedData.length -1 ][1] != null){
								sortedData.push([
									Math.floor(new Date().getTime()),
							 		sortedData[sortedData.length -1][1]
							 	]);

							}
							var sensor = new helper.Sensor(device.deviceid, device.place, sortedData, 'line', 'solid', '#ff00ff', '', 0, false, true, false);
							sensor.color = undefined;
							// console.log(sensor);
							callback(sensor);
						}
					});
				// }
				});
			}
		});
	}
}