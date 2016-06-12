var temperatureFunctions = require('../functions/temperature.js');

module.exports = function(app, db){
	app.io.route('getSensors', function(req, res){
		temperatureFunctions.getSensors(req, res, function(data){
			req.io.emit('sensors', data);
		});
	});
	app.io.route('getSensor', function(req, res){
		var id = req.data.id;
		temperatureFunctions.getSensor(id, req, res, function(data){
			req.io.emit('sensor', data);
		});
	});
	app.io.route('saveSensor', function(req, res){
		temperatureFunctions.saveSensor(req.data, req, res);
	});
	app.io.route('deleteSensor', function(req, res){
		var id = req.data;
		temperatureFunctions.deleteSensor(id, req, res, function(data){
			temperatureFunctions.getSensors(req, res, function(data){
				app.io.broadcast('sensors', data);
			});
		});
	});
	app.io.route('getCharttypen', function(){
		temperatureFunctions.getCharttypen(req, res, function(data){
			req.io.emit('charttypen', data);
		});
	});
	/*****************************************
	Socket.io routes für Sensordaten
	*****************************************/
	app.io.route('getSensorvalues', function(req, res){
		temperatureFunctions.getSensorvalues(req, res, function(data){
			req.io.emit('Sensorvalues', data);
		});
	});
}