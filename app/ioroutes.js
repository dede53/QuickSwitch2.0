var temperatureFunctions = require('../functions/temperature.js');
module.exports = function(app, db){
	app.io.route('getSensors', function(req, res){
		temperatureFunctions.getSensors(function(data){
			req.io.emit('sensors', data);
		});
	});
	/*****************************************
	Socket.io routes für Sensordaten
	*****************************************/
	app.io.route('getSensorvalues', function(req, res){
		temperaturFunctions.getSensorvalues(function(data){
			req.io.emit('Sensorvalues', data);
		});
	});
}