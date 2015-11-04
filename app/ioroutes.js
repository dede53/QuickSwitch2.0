module.exports = function(app, db){
	/*****************************************
	Socket.io routes für Sensordaten
	*****************************************/
	app.io.route('getSensorvalues', function(req, res){
		var hour = req.data.date;
		console.log("lese Temperaturdaten...");
		var query ="SELECT sensors.nodeID 	AS nodeID, sensors.name 		AS name, sensors.linecolor 	AS farbe, linetypen.line	AS linetype, charttypen.chart	AS charttype FROM sensors, linetypen, charttypen WHERE sensors.linetype	== linetypen.id AND sensors.charttype	== charttypen.id AND sensors.nodeID	== sensors.nodeID;";
		db.each(query, function(err, sensor){
			if(err){
				console.log(err);
			}else{
				if(hour == "all"){
					var query = "SELECT time, temp / 100  as temp, strftime('%M', time / 1000, 'unixepoch') as min, strftime('%S', time / 1000, 'unixepoch') as sec FROM sensor_data WHERE sec < '04' AND sec >= '00' AND min == '00' AND nodeID = '"+ sensor.nodeID +"';";
				}else{
					var hourInSec = 3600000 * hour;
					var query = "SELECT time, temp / 100  as temp, strftime('%M', time / 1000, 'unixepoch') as min, strftime('%S', time / 1000, 'unixepoch') as sec FROM sensor_data WHERE sec < '04' AND sec >= '00' AND min == '00' AND nodeID = '"+ sensor.nodeID +"' AND time > ((strftime('%s','now') * 1000) - "+ hourInSec +");";
				}
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
						
						req.io.emit('Sensorvalues', data);
						console.log("Temperaturdaten gesendet!");
					}
				});
			}
		});
	});

	app.io.route('getSensorvaluesByMinutes', function(req, res){
		console.log(req.data);
		var min = Math.round(req.data.min);
		var max = Math.round(req.data.max);
		var range = max - min;

		// two days range loads minute data
		if(range < 2 * 24 * 3600 * 1000){
			var valueQuery = "SELECT time, temp / 100  as temp, strftime('%M', time / 1000, 'unixepoch') as min, strftime('%S', time / 1000, 'unixepoch') as sec FROM	sensor_data WHERE	sec < '04' AND		sec >= '00' AND		(min  == '00' OR min == '15' OR min == '30' OR min == '45') AND time <= "+ max +" AND time >= "+ min;
		

		// one month range loads hourly data
		} else{
		//} else if (range < 31 * 24 * 3600 * 1000) {
			var valueQuery = "SELECT time, temp / 100  as temp, strftime('%M', time / 1000, 'unixepoch') as min, strftime('%S', time / 1000, 'unixepoch') as sec FROM	sensor_data	WHERE	sec < '04' AND		sec >= '00' AND		min  == '00'";
		

		// one year range loads daily data
		}
		//else{
		//	var valueQuery = "SELECT time, temp / 100  as temp, strftime('%H', time / 1000, 'unixepoch') as hour, strftime('%M', time / 1000, 'unixepoch') as min, strftime('%S', time / 1000, 'unixepoch') as sec FROM	sensor_data	WHERE	sec < '04' AND		sec >= '00' AND		min  == '00' AND 	hour == '00'";
		//}

		console.log("IO_ROUTE_getSensorvaluesByMinutes");
		var query ="SELECT sensors.nodeID		AS nodeID, sensors.name		AS name, sensors.linecolor	AS farbe, linetypen.line		AS linetype, charttypen.chart	AS charttype FROM sensors, linetypen, charttypen WHERE	sensors.linetype	== linetypen.id AND		sensors.charttype	== charttypen.id;";
		db.all(query, function(err, sensors){
			if(err){
				console.log(err);
			}else{
				console.log("Lade Daten");
				sensors.forEach(function(sensor){

					// var query = "SELECT time, temp / 100  as temp FROM      sensor_data WHERE     strftime('%M', time / 1000, 'unixepoch') == '00' AND       strftime('%S', time / 1000, 'unixepoch') < '04' AND       strftime('%S', time / 1000, 'unixepoch') >= '00' AND nodeID = '"+ sensor.nodeID +"';";
					var query = valueQuery + " AND nodeID = " + sensor.nodeID + ";";
					db.all(query , function(err, data) {
						if (err) {
							console.log(err);
						}else{
							console.log(data);
							var bla = new Array;
							data.forEach(function(uff){
								var asd = new Array;
								asd.push(Math.floor(uff.time));
								asd.push(parseFloat(uff.temp));
								bla.push(asd);
							});
							
							var data		= new Object;
							data.data		= bla;
							data.nodeID		= sensor.nodeID;
							
							req.io.emit('SensorvaluesByMinutes', data);
							/*
							*/
							console.log("gesendet!");
						}
					});
				});
			}
		});
	/*
		db.each(query, function(err, sensor){
			if(err){
				console.log(err);
			}else{
				console.log("Lade Daten");
				// var query = "SELECT time, temp / 100  as temp FROM      sensor_data WHERE     strftime('%M', time / 1000, 'unixepoch') == '00' AND       strftime('%S', time / 1000, 'unixepoch') < '04' AND       strftime('%S', time / 1000, 'unixepoch') >= '00' AND nodeID = '"+ sensor.nodeID +"';";
				var query = "SELECT time, temp / 100  as temp, strftime('%M', time / 1000, 'unixepoch') as min, strftime('%S', time / 1000, 'unixepoch') as sec FROM sensor_data WHERE sec < '04' AND sec >= '00' AND (min  == '00' OR min == '30') AND  nodeID = '"+ sensor.nodeID +"';";
				db.all(query , function(err, data) {
					if (err) {
						console.log(err);
					}else{
						console.log(data);
						var bla = new Array;
						data.forEach(function(uff){
							var asd = new Array;
							asd.push(Math.floor(uff.time));
							asd.push(parseFloat(uff.temp));
							bla.push(asd);
						});
						
						var data		= new Object;
						data.data		= bla;
						data.nodeID		= sensor.nodeID;
						
						req.io.emit('SensorvaluesByMinutes', data);
						console.log("gesendet!");
					}
				});
			}
		});
	*/
	});
}