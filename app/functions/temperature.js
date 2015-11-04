var helper = require('../functions/helper.js');
var db 				= require('./database.js');

module.exports = {
	saveSensorValues: function(data,req,res,callback){
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
/*
		var query = "SELECT * FROM sensor_data;";
		db.all(query, function(err, row){
			console.log(row.length);
		});
*/
	},
	getSensors: function (req,res,callback){
		var query = "SELECT * FROM sensors;";
		db.all(query, function(err, data){
			if(err){
				console.log(err);
			}else{
				callback(data);
			}
		});
	},
	getSensorvalues: function (id,date, req, res, callback) {
		console.log(id);
		console.log(date);
		/*
		getSensors( req, res, function(data){
			var sensorIDs = new Array;
			if(id == "all"){
					console.log(data);
					data.forEach(function(sensor){
						console.log(sensor.id);
						sensorIDs.push(sensor.id);
					});
			}else{
				sensorIDs.push(data[0].id);
			}
			// sensorIDs = Array mit den ID's der Sensoren. zb: [1,2]
			switch(date){
				case "latest":
					var query = "SELECT place, time. supplyV, temp, hum FROM sensor_data WHERE nodeID = '" +  + "';";
					break;
				case "24":
					break;
				case "24":
					break;
			}
		});
	*/
		// if(date == "latest" && id == "all"){
			// // var query = "SELECT place,time,supplyV,temp,hum FROM sensor_values WHERE nodeID='" + id + "' ORDER BY id DESC Limit 1 ;";
			// var query = "SELECT place,time,supplyV,temp,hum FROM sensor_data ORDER BY id DESC Limit 3;";
		// }else if(date == "lastday"){
			// var query = "SELECT place,time,supplyV,temp,hum FROM sensor_data WHERE time >= strftime('%s',datetime('now','-24 hour')) AND time <= strftime('%s','now') AND  nodeID='" + id + "';";
		// }else if(date == "all" && id == "all"){
			// var query = "SELECT place,time,supplyV,temp,hum FROM sensor_data ORDER BY place;";
		// }else if(date == "all" && id == "dia"){
			// var query = "SELECT time, temp FROM sensor_data WHERE nodeID = '"+id+"' GROUP BY  strftime('%Y-%m-%d %H', time / 1000, 'unixepoch', 'localtime');";
			//var query = "SELECT time, temp FROM sensor_data WHERE nodeID = '"+id+"';";
		// }else{
			// var query = "SELECT place,time,supplyV,temp,hum,date(time,'unixepoch') AS Date FROM sensor_data WHERE Date='"+ date +"' AND nodeID='" + id + "';";
		// }
		// var query = "SELECT * FROM sensor_data WHERE strftime('%M', time / 1000, 'unixepoch') == '00' AND strftime('%S', time / 1000, 'unixepoch') < '04' AND strftime('%S', time / 1000, 'unixepoch') >= '00' AND nodeID == '"+ id +"';";

		// var query = "SELECT time, temp / 100  as temp FROM      sensor_data WHERE     strftime('%M', time / 1000, 'unixepoch') == '00' AND       strftime('%S', time / 1000, 'unixepoch') < '04' AND       strftime('%S', time / 1000, 'unixepoch') >= '00';";
		var query = "SELECT time, temp / 100  as temp FROM sensor_data WHERE nodeID='" + id + "' ORDER BY id  ;"
		db.all(query , function(err, row) {
			if (err) {
				console.log(err);
				callback(404);
			}else if(row == ""){
				callback("Keine Daten für den Sensor mit der ID" + id);
				console.log("Keine Daten für den Sensor mit der ID" + id);
			}else{
				callback(row);
			}
		});
	}
	
}