var helper 			= require('../functions/helper.js');
var db 				= require('./database.js');
var async 			= require("async");

module.exports = {
	saveSensorValues: function(data, req, res, callback){
		/**************************
		{
		"nodeID": 15,
		"supplyV": 2.2,
		"temp":12.3,
		"hum":59,
		"timestamp":141234123412
		}
		**************************/
		helper.log("Temperaturdaten geliefert", "info");
		if(!data.timestamp){	
			var now = Math.floor(Date.parse(new Date));
		}else{
			var now = data.timestamp;
		}

		if(data.hum != ""){
			var hum = 0;
		}else{
			var hum = data.hum;
		}
		var query = "INSERT INTO sensor_data ( nodeID, supplyV, temp, hum, time) VALUES ('"+ data.nodeID +"', '"+ data.supplyV +"', '"+ data.temp +"', '"+ hum +"', '"+ now +"');";

		db.all(query, function(err, row){
			if(err){
				console.log(err);
			}else{
				callback("200");
			}
		});
	},
	getSensor: function (id, req, res, callback){
		var query = "SELECT sensors.id, sensors.name, sensors.nodeid, sensors.linetype, sensors.linecolor FROM sensors AND id = " + id + ";";
		db.all(query, function(err, data){
			if(err){
				console.log(err);
			}else{
				callback(data);
			}
		});
	},
	getSensors: function (req, res, callback){
		var query = "SELECT sensors.id, sensors.name, sensors.nodeid,sensors.charttype, sensors.linetype, sensors.linecolor FROM sensors;";
		db.all(query, function(err, data){
			if(err){
				console.log(err);
			}else{
				callback(data);
			}
		});
	},
	saveSensor: function(data, req, res, callback){
		if(typeof data.id == 'number'){
			var query = "UPDATE sensors SET name = '" + data.name + "', nodeid = " + data.nodeid + ", charttype = '" + data.charttype + "', linetype = '" + data.linetype + "', linecolor = '" + data.linecolor + "' WHERE id = " + data.id + ";";
		}else{
			var query = "INSERT INTO sensors (name, nodeid, charttype, linetype, linecolor) VALUES ('" + data.name + "', '" + data.nodeid + "', '" + data.charttype + "', '" + data.linetype + "', '" + data.linecolor + "');";
		}
	
		db.all(query, function(err, row){
			if(err){
				console.log(err);
			}else{
				callback("200");
			}
		});
	
	},
	deleteSensor: function(id, req, res, callback){
		var query = "DELETE FROM `sensors` WHERE `sensors`.`id` = " + id + ";";
		console.log(query);
		db.all(query, function(err, rows){
			if(err){
				console.log('Error: ' + err);
				callback('Error: ' + err);
			}else{
				callback("200");
			}
		});
	},
	getSensorvalues: function (req, res, callback) {
		// var hour = req.data.date;
		console.log("lese Temperaturdaten...");
		var hours = 36;

		var query ="SELECT sensors.nodeID 	AS nodeID, sensors.name AS name, sensors.linecolor 	AS farbe, charttype, linetype FROM sensors;";
		db.all(query, function(err, sensor){
			if(err){
				console.log(err);
			}else{
				var alldata = new Array;
				async.each(sensor,
					function(sensor, callback){
							var query = "SELECT nodeid, temp / 100 as temp, time, hum FROM sensor_data WHERE nodeid = '" + sensor.nodeID + "' AND ROUND(time / 1000) <= UNIX_TIMESTAMP() AND ROUND(time / 1000) >= UNIX_TIMESTAMP(DATE_SUB(NOW(), INTERVAL " + hours + " hour)) GROUP BY HOUR( FROM_UNIXTIME(ROUND(time / 1000)) ) , DATE( FROM_UNIXTIME(ROUND(time / 1000)) ) ORDER BY time ASC;";
						/*
							SELECT
								nodeid,
							    temp / 100 as temp,
							    time
							FROM 
								sensor_data
							WHERE 
								nodeid =  '" + sensor.nodeID + "' 
								AND ROUND(time / 1000) <= UNIX_TIMESTAMP() 
								AND ROUND(time / 1000) >= UNIX_TIMESTAMP(DATE_SUB(NOW(), INTERVAL 36 hour)) 
							GROUP BY 
								HOUR( FROM_UNIXTIME(ROUND(time / 1000)) ), 
								DATE( FROM_UNIXTIME(ROUND(time / 1000)) )
								# Nur wenn halbstündlich werte!
								#,(ROUND(timestamp/3600)*3600)
							ORDER BY time ASC;
						*/
						db.all(query , function(err, sensordata) {
							if (err) {
								console.log(err);
							}else{
								var bla = new Array;
								sensordata.forEach(function(uff){
									var asd = new Array;
									asd.push(Math.floor(uff.time));
									asd.push(parseFloat(uff.temp));
									bla.push(asd);
								});
						
								var data = new helper.Sensor(sensor.nodeID, sensor.name, bla, sensor.charttype, sensor.linetype, sensor.farbe, " °C", 0);

								alldata.push(data);

								if(sensordata[sensordata.length - 1].hum != 0){
									var hum = new Array;
									sensordata.forEach(function(ind){
										var asd1 = new Array;
										asd1.push(Math.floor(ind.time));
										asd1.push(parseFloat(ind.hum));
										hum.push(asd1);
									});

									var humsensor = new helper.Sensor(sensor.nodeID + "hum", sensor.name + " (Feuchte)", hum, sensor.charttype, sensor.linetype, sensor.farbe, " %", 1);

									alldata.push(humsensor);
								}
								callback();
							}
						});
					},
					function(err){
						if(err){
							console.log(err);
						}else{
							callback(alldata);
							console.log("Temperaturdaten gesendet!");
						}
					}
				);
			}
		});
	}
}