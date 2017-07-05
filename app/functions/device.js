var db 				= require('./database.js');
var SwitchServer	= require('./SwitchServer.js');
var async 			= require("async");

function getDevice(id, callback){
	var query = "SELECT devices.*, rooms.name AS Raum FROM devices, rooms WHERE devices.roomid = rooms.id AND devices.deviceid = " + id + ";";
	db.all(query , function(err, row) {
		if (err) {
			log.error(err);
			callback(404);
		}else if(row == ""){
			callback("Kein Gerät mit der ID " + id);
		}else{
			callback(row[0]);
		}
	});
}

function Sensor(id, name, data, charttype, linetype, farbe, valueSuffix, yAxis, step, showAll, connectNulls){
	this.id = id;
	this.name = name;
	this.data = data;
	this.step = step;
	// this.step = Boolean(step);
	this.showAllData = showAll;
	this.type = charttype;
	this.dashStyle = linetype;
	this.color = farbe;
	this.yAxis = yAxis;
	this.connectNulls = connectNulls;
	this.marker = new Object;
	this.marker.symbol = "diamond";
	this.marker.radius = 3;
	this.tooltip = new Object;
	this.tooltip.valueSuffix = valueSuffix;
}

module.exports = {
	getDevices: function(type, callback){
		if(type == "object"){
			var uff = new Object;
		}else{
			var uff = new Object;
		}
		var query = "SELECT * FROM rooms;";
		db.all(query, function(err, row){
			if(err){
				log.error(err);
				callback(404);
			}else{
				async.each(row,
					function(row, callback){
						var query = "SELECT rooms.name AS Raum, devices.* FROM devices, rooms WHERE devices.roomid = '" + row.id + "'     AND    devices.roomid = rooms.id AND devices.type = 'device';";
						db.all(query , function(err, data) {
							if(err){
								log.error(err);
							}else{
								if(type == "object"){
									var bla = new Object;
									bla.room = row;
									bla.room.isCollapsed = true;

									bla.roomdevices = new Object;
									data.forEach(function(dat){
										bla.roomdevices[dat.deviceid] = dat;
									});

									uff[row.name] = bla;
								}else{
									data.forEach(function(dat){
										uff[dat.deviceid] = dat;
									});
									
								}
								callback();
							}
						});
					},
					function(err){
						if(err){
							log.error(err);
						}else{
							callback(uff);
						}
					}
				);
			}
		});		
	},
	getDevice: getDevice,
	setDeviceStatus: function(id, status){
		if(id == "all"){
			var query = "UPDATE devices SET status = '"+ status +"';";
		}else{
			var query = "UPDATE devices SET status = '"+ status +"' WHERE deviceid = "+ id +";";
		}
		db.run(query);
	},
	saveDevice: function (data, callback){
		if(data.deviceid){
			var query = "UPDATE devices SET name = '"+ data.name +"', protocol = '"+ data.protocol +"', showStatus = '"+ data.showStatus +"', buttonLabelOn = '"+ data.buttonLabelOn +"', buttonLabelOff = '"+ data.buttonLabelOff +"', CodeOn = '"+ data.CodeOn +"', CodeOff = '"+ data.CodeOff +"', roomid = '"+ data.roomid +"', switchserver = '" + data.switchserver + "' WHERE deviceid = '"+ data.deviceid +"';";
			db.run(query);
			getDevice(data.deviceid, function(dev){
				callback(undefined, dev);
			});
		}else{
			var query = "INSERT INTO devices ( name, protocol, showStatus, buttonLabelOn, buttonLabelOff, CodeOn, CodeOff, roomid, switchserver ) VALUES ('"+ data.name +"', '"+ data.protocol +"', '"+ data.showStatus +"', '"+ data.buttonLabelOn +"', '"+ data.buttonLabelOff +"', '"+ data.CodeOn +"', '"+ data.CodeOff +"', '"+ data.roomid +"', '" + data.switchserver + "');";
			db.all(query, function(err, data){
				if(err){
					callback(err, undefined);
				}else{
					getDevice(data.insertId, function(data){
						callback( undefined, data);
					});
				}
			});
		}
	},
	deleteDevice: function (id, callback) {
		var query = "SELECT * FROM devices WHERE deviceid = " + id + ";";
		db.all(query , function(err, row) {
			if (err) {
				log.error(err);
				callback('Error: ' + err);
			}else if (row == "") {
				callback("300");
				log.info("Kein Gerät mit der ID");
			} else {
				var query = "DELETE FROM devices WHERE deviceid = "+ id +";";
				db.all(query ,function(err,rows){
					if(err){
						log.error(err);
						callback(err);
					}else{
						log.info('Delete switch with id: ' + id);
						callback("200");
					}
				});
			}
		});
	},
	switchDevice: function (app, id, status, callback) {
		console.log(id, status);
		var query = "SELECT deviceid, status, devices.name, protocol, buttonLabelOff, buttonLabelOn, switchserver, CodeOn, CodeOff, type, showStatus, devices.roomid, rooms.name AS Raum FROM devices, rooms WHERE deviceid = '" + id + "' AND devices.roomid = rooms.id;";
		db.all(query , function(err, row) {
			if (err) {
				log.error(err);
				callback(404);
			}else if(row == ""){
				callback(404);
			}else{
				SwitchServer.sendto(app, status, row[0] ,function(status){
					callback(status);
				});
			}
		});
	},
	switchDevices: function (app, status, req, callback) {
		var query = "SELECT deviceid, status, devices.name, protocol, buttonLabelOff, buttonLabelOn, switchserver, CodeOn, CodeOff, type , showStatus, devices.roomid, rooms.name AS Raum FROM devices, rooms WHERE devices.roomid = rooms.id AND devices.status != " + status + " AND devices.type = 'device' AND devices.showStatus = '1';";
		db.all(query , function(err, row) {
			if (err) {
				log.error(err);
				callback(404);
			}if(row.length == 0){
				callback(200);
			}else{
				row.forEach(function(dev){
					SwitchServer.sendto(app, status, dev, function(status){
						callback(200);
					});
				});
			}
		});
	},
	favoritDevices: function (favoritDevices, callback){
		if(favoritDevices == false){
			callback(false);
		}

		var favorits	= [];
		var bla 		= {};
		var query 		= "SELECT rooms.name AS Raum, devices.* FROM devices, rooms WHERE devices.roomid = rooms.id AND devices.type = 'device';";
		db.all(query , function(err, users) {
			if(err){
				log.error(err);
			}else{
				users.forEach(function(dat){
					bla[dat.deviceid] = dat;								
				});
				favoritDevices.forEach(function(deviceid){
					favorits.push(bla[deviceid]);
				});
				callback(favorits);
			}
		});
	},
	activeDevices: function(callback){
		var query = "SELECT devices.name, rooms.name AS room FROM devices, rooms WHERE devices.roomid = rooms.id AND status != 0 AND devices.type = 'device' AND showStatus = 1;";
		db.all(query , function(err, activedevices){
			if (err) {
				log.error(err);
				callback(404);
			}else{
				callback(activedevices);
			}
		});
	},
	getSwitchHistory: function(hours, callback){
		var query = "SELECT * FROM `switch_history` WHERE time > '" + new Date(new Date().getTime() - (hours * 60000 * 60)).getTime() + "';";
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
							var sensor = new Sensor(device.deviceid, device.place, sortedData, 'line', 'solid', '#ff00ff', '', 0, false, true, false);
							sensor.id = device.deviceid;
							sensor.color = undefined;
							callback(sensor);
						}
					});
				});
			}
		});
	}
}