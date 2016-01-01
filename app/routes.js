var deviceFunctions 		= require('./functions/device.js');
var roomFunctions 			= require('./functions/room.js');
var groupFunctions 			= require('./functions/group.js');
var temperatureFunctions 	= require('./functions/temperature.js');
var userFunctions 			= require('./functions/user.js');
var messageFunctions 		= require('./functions/message.js');

module.exports = function(app, db){
	app.get('/', function(req, res) {
		res.sendfile(__dirname + '/public/index.html');
	});
	app.get('/mobile', function(req, res) {
		res.sendfile(__dirname + '/public/mobile');
	});

	app.get('/pc', function(req, res) {
		res.sendfile(__dirname + '/public/pc');
	});

	app.get('/settings', function(req, res) {
	    res.sendfile(__dirname + '/public/settings');
	});

	// REST JSON API

	app.get('/switches', function (req, res) {
		deviceFunctions.getDevices('object',req, res, function(data){
			res.json(data);
		});
	});
	app.get('/switches/:id', function (req, res) {
		var id = req.params.id;
		deviceFunctions.getDevice(id, req, res, function(data){
			res.json(data);
		});
	});
	app.post('/switches', function (req, res) {
		deviceFunctions.saveNewDevice(req, res, function(data){
			res.json(data);
		});
	});
	app.put('/switches/:id', function (req, res) {
		id = req.params.id;
		status = req.body.status;
		deviceFunctions.switchDevice(app, id, status, req, res, function(data){
			if(data == 200){
				console.log('Successful: Switch Device with id: ' + id + " to " + status);
				res.json(200);
			}
		});
	});
	app.put('/switches', function (req, res) {
		status = req.body.status;
		deviceFunctions.switchDevices(app, status, req, res, function(data){
			if(data == 200){
				console.log('Successful: Switch Devices ' + status);
				res.json(200);
			}
		});
	});
	app.delete('/switches/:id', function (req, res) {
		var id = req.params.id;
		deviceFunctions.deleteDevice(id, req, res, function(data){
			res.json(data);
		});
	});
	app.get('/switch/:type/:id/:status', function (req, res) {
		var id = req.params.id;
		var status = req.params.status;
		var type = req.params.type;
		switch(type){
			case "device":
				deviceFunctions.switchDevice(app, id, status, req, res, function(data){
					if(data == 200){
						res.json(200);
					}else{
						res.json(data);
					}
				});
				break;
			case "group":
				groupFunctions.getGroup(id, req, res, function(group){
					if(group == "404"){
						res.json(404);
					}else{
						groupFunctions.switchGroup(app, group[0], status, req, res, function(data){
							if(data == 200){
								res.json(200);
							}else{
								res.json(data);
							}
						});
					}
				});
				break;
			case "room":
				roomFunctions.getRoom(id, req, res, function(room){
					roomFunctions.switchRoom(room, status, req, res, function(data){
						if(data == 200){
							res.json(200);
						}else{
							res.json(data);
						}
					});
				});
				break;
		}
	});

	app.get('/rooms', function (req, res) {
		roomFunctions.getRooms(req, res, function(data){
			res.json(data);
		});
	});
	app.get('/rooms/:id', function (req, res) {
		var id = req.params.id;
		deviceFunctions.getRoom(id, req, res, function(data){
			res.json(data);
		});
	});
	app.get('/groups', function (req, res) {
		groupFunctions.getGroups(req, res, function(data){
			res.json(data);
		});
	});


	app.get('/sensor/:id/:date', function (req, res) {
		temperatureFunctions.getSensorvalues(req, res, function(data){
			res.send(data);
		});
	});
	app.get('/sensors', function (req, res) {
		temperatureFunctions.getSensors(req, res, function(data){
			res.send(data);
		});
	});
	app.get('/getUsers', function(req,res){
		userFunctions.getUsers( req, res, function(data){
			res.json(data);
		});
	});

	app.get('/getMessages/:data', function(req,res){
		var data = req.params.data;
		messageFunctions.loadOldMessages(data, function(data){
			res.json(data);
		});
	});

	app.post('/newdata', function(req, res){
		var data = req.body;
		temperatureFunctions.saveSensorValues(data, req, res, function(request){
			res.json(request);
		});
	});

	app.get('/temperature/reloadTempData', function(req, res){
		// res.send("Lade Daten...");
		temperatureFunctions.getSensorvalues(req, res, function(data){
			app.io.broadcast('Sensorvalues', data);
			res.status(200).end();
		});
	});
}