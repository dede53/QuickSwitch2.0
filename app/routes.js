var deviceFunctions 		= require('./functions/device.js');
var roomFunctions 			= require('./functions/room.js');
var groupFunctions 			= require('./functions/group.js');
var temperatureFunctions 	= require('./functions/temperature.js');
var userFunctions 			= require('./functions/user.js');
var messageFunctions 		= require('./functions/message.js');
var variableFunctions 		= require('./functions/variable.js');
var timerFunctions 			= require('./functions/timer.js');
var SwitchServerFunctions 	= require('./functions/SwitchServer.js');
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
+	/devices/id				(PUT)		speichert geändertes Gerät anhand der ID
+	/devices 				(POST)		speichert neues Gerät

+	/groups 				(GET)		liefert object der Gruppen
+		/id 				(GET)		liefert eine Gruppe anhand der ID
+	/groups/id  			(DELETE)	löscht ein Gerät anhand der ID
+	/groups/id 				(PUT)		speichert geänderte Gruppe anhand der ID
+	/groups 				(POST)		speichert neue Gruppe

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

	/setVariable 			(GET)		setzt den Status einer Variablen
			/name 							Name der Variablen (z.b.: festnetz)
				/status 					Status der Variablen (z.b.: klingelt)
					/data 					Daten zu Variablen (nicht zwingend anzugeben!)(z.b.: Telefonnummer)
						/error 				Error (nicht zwingend anzugeben!)(true|false)
	/setVariableByNodeid 			(GET)		setzt den Status einer Variablen
			/Nodeid							Nodeid der Variablen (z.b.: festnetz)
				/status 					Status der Variablen (z.b.: klingelt)
					/data 					Daten zu Variablen (nicht zwingend anzugeben!)(z.b.: Telefonnummer)
						/error 				Error (nicht zwingend anzugeben!)(true|false)

	/alert 					(GET)		erzeugt Popup
		/name 							Name des Popups
			/message 					Nachricht
				/type 					Type der Nachricht(nicht zwingend anzugeben!):
											primary: (blau - kräftig)
											success(grün)
											info(blau)
											warning (orange)
											danger (rot)
											default (weiß)
	/send
		/alert 				(GET)		erzeugt Popup
			/title						Name/Überschrift
				/message 				Nachricht
					/type 				Type der Nachricht(nicht zwingend anzugeben!):
											primary: (blau - kräftig)
											success(grün)
											info(blau)
											warning (orange)
											danger (rot)
											default (weiß)
		/pushbullet			(GET)		sendet Pushbullet nachricht
			/title						Name/Überschrift
				/message 				Nachricht
					/type


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
	**	Gerät anhand der ID	********************************************************
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
	********************************************************************************
		data = {
			"deviceid":2,
			"name": "Devicename",
			"protocol": "protocolID",
			"buttonLabelOn": "ButtonTextAn",
			"buttonLabelOff": "ButtonTextAus",
			"CodeOn":"Einschaltcode",
			"CodeOff":"Ausschaltcode",
			"room":"(int) roomid",
			"switchserver": "(int) switchserverid"
		}
	*******************************************************************************/
	app.put('/devices', function(req, res){
		deviceFunctions.saveEditDevice(data, req, res, function(data){
			res.json(data);
		})
	});
	/*******************************************************************************
	**	neues Gerät	****************************************************************
	********************************************************************************
		data = {
			"name": "Devicename",
			"protocol": "protocolID",
			"buttonLabelOn": "ButtonTextAn",
			"buttonLabelOff": "ButtonTextAus",
			"CodeOn":"Einschaltcode",
			"CodeOff":"Ausschaltcode",
			"room":"(int) roomid",
			"switchserver": "(int) switchserverid"
		}
	*******************************************************************************/
	app.post('/devices', function (req, res) {
		deviceFunctions.saveNewDevice(data, req, res, function(data){
			res.json(data);
		});
	});

	/*******************************************************************************
	**	alle Gruppen	************************************************************
	*******************************************************************************/
	app.get('/groups', function(req, res){
		groupFunctions.getGroups(req, res, function(data){
			res.json(data);
		});
	});

	/*******************************************************************************
	**	Gruppe anhand der ID	****************************************************
	*******************************************************************************/
	app.get('/groups/:id', function(req, res){
		var id = req.params.id;
		groupFunctions.getGroup(id, req, res, function(data){
			res.json(data);
		})
	});

	/*******************************************************************************
	**	Gruppe löschen	************************************************************
	*******************************************************************************/
	app.delete('/groups/:id', function(req, res){
		var id = req.params.id;
		groupFunctions.deleteGroup(id, req, res, function(data){
			res.json(data);
		});
	});

	/*******************************************************************************
	**	bearbeitete Gruppe speichern	********************************************
	********************************************************************************
		data = {
			"id":2,
			"name": "Gruppenname",
			"devices": "[1,2,3,4,5]" // Deviceids
		}
	*******************************************************************************/
	app.put('/groups', function(req, res){
		groupFunctions.saveEditGroup(data, req, res, function(data){
			res.json(data);
		});
	});

	/*******************************************************************************
	**	neue Gruppe speichern	****************************************************
	********************************************************************************
		data = {
			"name": "Gruppenname",
			"devices": "[1,2,3,4,5]" // Deviceids
		}
	*******************************************************************************/
	app.post('/groups', function(req, res){
		groupFunctions.saveNewGroup(data, req, res, function(data){
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
		temperatureFunctions.saveSensorValues(data, req, res, function(status){
			res.json(status);
		});
	});

	app.get('/temperature/reloadTempData', function(req, res){
		variableFunctions.getStoredVariables("all", function(variable){
			app.io.broadcast('storedVariable', variable);
		});
		res.status(200).end();
	});

	app.get('/setVariable/:name/:status', function(req, res){
		var name = req.params.name;
		var status = req.params.status;
		var variable = {
			"name": name,
			"status": status
		}
		variableFunctions.setVariable(variable, app, function(data){
			timerFunctions.checkTimer(variable);
			res.json(data);
		});
	});
	app.get('/setVariableByNodeid/:nodeid/:status', function(req, res){
		variableFunctions.setVariableByNodeid(req.params, app, function(data){
			timerFunctions.checkTimer(data);
			res.json(data);
		});
	});
	app.post('/setVariableByNodeid', function(req, res){
		variableFunctions.setVariableByNodeid(req.body, app, function(data){
			timerFunctions.checkTimer(data);
			res.json(data);
		});
	});
	app.get('/send/alert/:title/:message/:type?', function(req, res){
		variableFunctions.replaceVar(req.params.message, function(message){
			variableFunctions.replaceVar(req.params.title, function(title){
				var alert = {
					"title": title,
					"message": message,
					"type": req.params.type
				}
				app.io.broadcast('alert', alert);
				res.status(200).end();
			});
		});
	});
	app.get('/send/pushbullet/:message/:title/:receiver', function(req, res){
		var push = {
			"type":"object",
			"object":{
				"protocol": "send-pushbullet",
				"title": req.params.title,
				"message": req.params.message,
				"receiver": req.params.receiver,
				"switchserver":0
			}
		}
		SwitchServerFunctions.sendto(app, req, "send", push,function(status){
			if(status != 200){
				console.log('SwitchServerFunctions.sendto:' + status);
			}
		});
		res.status(200).end();
	});
}