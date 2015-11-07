var helper = require('../functions/helper.js');
var db 				= require('./database.js');

module.exports = {
	saveSensorValues: function(data, req, res, callback){
		/**************************
		{
		"nodeID": 15,
		"supplyV": 2.2,
		"temp":12.3,
		"hum":59
		}
		**************************/
		var now = Math.floor(Date.parse(new Date));

		if(data.hum != ""){
			var query = "INSERT INTO sensor_data ( nodeID, supplyV, temp, hum, time) VALUES ('"+ data.nodeID +"', '"+ data.supplyV +"', '"+ data.temp +"', '"+ data.hum +"', '"+ now +"');";
		}else{
			var query = "INSERT INTO sensor_data ( nodeID, supplyV, temp, time) VALUES ('"+ data.nodeID +"', '"+ data.supplyV +"', '"+ data.temp +"', '"+ now +"');";
		}

		db.all(query, function(err, row){
			if(err){
				console.log(err);
			}else{
				callback("200");
			}
		});
	},
	getSensor: function (id, req, res, callback){
		var query = "SELECT sensors.id, sensors.name, sensors.nodeid, charttypen.name as charttypen, sensors.linetype, sensors.linecolor FROM sensors, charttypen WHERE sensors.charttype = charttypen.id AND id = " + id + ";";
		db.all(query, function(err, data){
			if(err){
				console.log(err);
			}else{
				callback(data);
			}
		});
	},
	getSensors: function (req, res, callback){
		var query = "SELECT sensors.id, sensors.name, sensors.nodeid,sensors.charttype, charttypen.chart as chart, sensors.linetype, linetypen.line, sensors.linecolor FROM sensors, charttypen, linetypen WHERE sensors.charttype = charttypen.id AND sensors.linetype = linetypen.id;";
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
			var query = "UPDATE sensors SET name = '" + data.name + "', nodeid = " + data.nodeid + ", charttype = " + data.charttype + ", linetype = " + data.linetype + ", linecolor = '" + data.linecolor + "' WHERE id = " + data.id + ";";
		}else{
			var query = "INSERT INTO sensors (name, nodeid, charttype, linetype, linecolor) VALUES ('" + data.name + "', " + data.nodeid + ", " + data.charttype + ", " + data.linetype + ", '" + data.linecolor + "');";
		}
		console.log(query);
		//callback(data);
	
		db.all(query, function(err, row){
			if(err){
				console.log(err);
			}else{
				callback("200");
			}
		});
	
	},
	getCharttypen: function(){
		var query = "SELECT id, name FROM charttypen;";
		db.all(query, function(err, data){
			if(err){
				console.log(err);
			}else{
				callback(data)
			}
		});
	},
	getSensorvalues: function (req, res, callback) {
		// var hour = req.data.date;
		console.log("lese Temperaturdaten...");


		var query ="SELECT sensors.nodeID 	AS nodeID, sensors.name 		AS name, sensors.linecolor 	AS farbe, linetypen.line	AS linetype, charttypen.chart	AS charttype FROM sensors, linetypen, charttypen WHERE sensors.linetype	= linetypen.id AND sensors.charttype	= charttypen.id AND sensors.nodeID	= sensors.nodeID;";
		db.each(query, function(err, sensor){
			if(err){
				console.log(err);
			}else{
				//var query ="SELECT nodeid, time, temp / 100 as temp, time / 1000 as timestamp FROM sensor_data WHERE nodeid = " + sensor.nodeID + " AND time >= (UNIX_TIMESTAMP(DATE_SUB(NOW(), INTERVAL 1 DAY)) * 1000) AND time <= (UNIX_TIMESTAMP() * 1000) GROUP BY (ROUND(timestamp/3600)*3600) ORDER BY time ASC";
				var query ="SELECT nodeid, time, temp / 100 as temp, time / 1000 as timestamp FROM sensor_data WHERE nodeid = " + sensor.nodeID + " GROUP BY (ROUND(timestamp/3600)*3600) ORDER BY time ASC";
				/*
				SELECT nodeid ,time,temp FROM sensor_data
                     WHERE nodeid = " + sensor.nodeid + "
                     AND time >= UNIX_TIMESTAMP(DATE_SUB(NOW(), INTERVAL 1 HOUR)) 
                     AND time <= UNIX_TIMESTAMP() 
                     ORDER BY time ASC;
				*/
				
				db.all(query , function(err, data) {
					if (err) {
						console.log(err);
					}else{
						var bla = new Array;
						data.forEach(function(uff){
							var asd = new Array;
							asd.push(Math.floor(uff.time));
							asd.push(parseFloat(uff.temp));
							bla.push(asd);
						});
						
						var data		= new Object;
						data.data		= bla;
						data.name		= sensor.name;
						data.farbe		= sensor.farbe;
						data.nodeID		= sensor.nodeID;
						data.linetype	= sensor.linetype;
						data.charttype	= sensor.charttype;
						
						callback(data);
						console.log("Temperaturdaten gesendet!");
					}
				});
			}
		});
	}
	
}