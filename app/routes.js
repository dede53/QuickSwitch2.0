var deviceFunctions 		= require('./functions/device.js');
var roomFunctions 			= require('./functions/room.js');
var groupFunctions 			= require('./functions/group.js');
var temperatureFunctions 	= require('./functions/temperature.js');
var userFunctions 			= require('./functions/user.js');
var messageFunctions 		= require('./functions/message.js');
/***********************************************************************************

+	/						(GET)		auswahl zwischen PC/Mobile

+	/mobile 				(GET)		Mobile-Oberfläche

+	/pc 					(GET)		PC-Oberfläche

+	/settings				(GET)		Einstellungen

+	/switch
+		/device
+			/id 	 		(GET)		schalte Gerät anhand der ID
+				/on
+				/off
+				/toggle

+			/all 			(GET)		schalte alle Geräte
+				/on
+				/off
+				/toggle

+		/group/id 			(GET)		schalte Gruppe anhand der ID
+				/on
+				/off
+				/toggle

+		/room/id 			(GET)		schalte Raum anhand der ID
+				/on
+				/off
+				/toggle
			

+	/devices 				(GET)		liefert object der Geräte
+		/id 				(GET)		liefert ein Gerät anhand der ID
+	/devices/id 			(DELETE)	löscht ein Gerät anhand der ID
-	/devices/id				(PUT)		speichert geändertes Gerät anhand der ID
+	/devices 				(POST)		speichert neues Gerät

	/groups 				(GET)		liefert object der Gruppen
		/id 				(GET)		liefert eine Gruppe anhand der ID
	/groups/id  			(DELETE)	löscht ein Gerät anhand der ID
	/groups/id 				(PUT)		speichert geänderte Gruppe anhand der ID
	/groups 				(POST)		speichert neue Gruppe

	/rooms 					(GET)		liefert object der Räume
		/id 				(GET)		liefert einen Raum anhand der ID
	/rooms/id 				(DELETE)	löscht ein Gerät anhand der ID
	/rooms/id 				(PUT)		speichert geänderten Raum anhand der ID
	/rooms 					(POST)		speichert neuen Raum

	/sensors 				(GET)		liefert object der Sensoren
		/id 				(GET)		liefert einen Sensor anhand der ID
	/sensors/id 			(DELETE)	löscht ein Gerät anhand der ID
	/sensors/id 			(PUT)		speichert geänderten Sensor anhand der ID
	/sensors 				(POST)		speichert neuen Sensor

	/users 					(GET)		liefert object der Benutzer
		/id 				(GET)		liefert einen Benutzer anhand der ID
	/users/id 				(DELETE)	löscht ein Gerät anhand der ID
	/users/id 				(PUT)		speichert geänderten User anhand der ID
	/users 					(POST)		speichert neuen Benutzer

	/temperature
		/new 				(POST)		speichert neue Temperaturwerte
										{
											"nodeID": 15,
											"supplyV": 2.2,
											"temp":12.3,
											"hum":59,
											"timestamp":141234123412
										}

		/reloadTempData		(GET)		lädt die Daten neu in die Graphen aller aktiven QuickSwitch instanzen

		/getValues
			/hours
				/interval


***********************************************************************************/
module.exports = function(app, db){

	/*******************************************************************************
	**	Auswahl zwischen Mobile und PC	********************************************
	*******************************************************************************/
	app.get('/', function(req, res) {
		res.sendfile(__dirname + '/public/index.html');
	});

	/*******************************************************************************
	**	Mobile-Oberfläche	********************************************************
	*******************************************************************************/
	app.get('/mobile', function(req, res) {
		res.sendfile(__dirname + '/public/mobile');
	});

	/*******************************************************************************
	**	PC-Oberfläche	************************************************************
	*******************************************************************************/
	app.get('/pc', function(req, res) {
		res.sendfile(__dirname + '/public/pc');
	});

	/*******************************************************************************
	**	Einstellungen	************************************************************
	*******************************************************************************/
	app.get('/settings', function(req, res) {
	    res.sendfile(__dirname + '/public/settings');
	});

	/*******************************************************************************
	**	Schaltfunktionen	********************************************************
	*******************************************************************************/
	app.get('/switch/:type/:id/:status', function (req, res) {
		var id = req.params.id;
		var status = req.params.status;
		var type = req.params.type;
		switch(type){
			case "device":
				if(id == "all"){
					deviceFunctions.switchDevices(app, status, req, res, function(data){
						if(data == 200){
							res.json(200);
						}else{
							res.json(data);
						}
					});
				}else{
					deviceFunctions.switchDevice(app, id, status, req, res, function(data){
						if(data == 200){
							res.json(200);
						}else{
							res.json(data);
						}
					});
				}
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


	/*******************************************************************************
	**	alle Geräte	****************************************************************
	*******************************************************************************/
	app.get('/devices', function (req, res) {
		deviceFunctions.getDevices('object',req, res, function(data){
			res.json(data);
		});
	});
	
	/*******************************************************************************
	**	Geräte anhand der ID	****************************************************
	*******************************************************************************/
	app.get('/devices/:id', function (req, res) {
		var id = req.params.id;
		deviceFunctions.getDevice(id, req, res, function(data){
			res.json(data);
		});
	});
	
	/*******************************************************************************
	**	Gerät löschen	************************************************************
	*******************************************************************************/
	app.delete('/devices/:id', function (req, res) {
		var id = req.params.id;
		deviceFunctions.deleteDevice(id, req, res, function(data){
			res.json(data);
		});
	});
	
	/*******************************************************************************
	**	bearbeitetes Gerät speichern	********************************************
	*******************************************************************************/
	app.put('devices', function(req, res){
		deviceFunctions.saveEditDevice(data, req, res, function(data){
			res.json(data);
		})
	});
	/*******************************************************************************
	**	neues Gerät	****************************************************************
	*******************************************************************************/
	app.post('/devices', function (req, res) {
		deviceFunctions.saveNewDevice(data, req, res, function(data){
			res.json(data);
		});
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