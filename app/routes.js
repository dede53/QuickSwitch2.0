var deviceFunctions 		= require('./functions/device.js');
var roomFunctions 			= require('./functions/room.js');
var groupFunctions 			= require('./functions/group.js');
var helper		 			= require('./functions/helper.js');
var userFunctions 			= require('./functions/user.js');
var messageFunctions 		= require('./functions/message.js');
var variableFunctions 		= require('./functions/variable.js');
var timerFunctions 			= require('./functions/timer.js');
var SwitchServerFunctions 	= require('./functions/SwitchServer.js');
var countdownFunctions	 	= require('./functions/countdown.js');
/***********************************************************************************
├── dist/
│   ├── bootstrap-clockpicker.css      # full code for bootstrap
│   ├── bootstrap-clockpicker.js
│   ├── bootstrap-clockpicker.min.css  # compiled and minified files for bootstrap
│   ├── bootstrap-clockpicker.min.js
│   ├── jquery-clockpicker.css         # full code for jquery
│   ├── jquery-clockpicker.js
│   ├── jquery-clockpicker.min.css     # compiled and minified files for jquery
│   └── jquery-clockpicker.min.js
└── src/                               # source code
    ├── clockpicker.css
    ├── clockpicker.js
    ├── sdf
    │	├──
	│	│
	│	│
	│	│
	├───
	│

You only have to go through a path of the tree and you have to connect the words with a slash (/). Only the id needs to be replaced.
eg: 
Switch Device with ID 1 on
http://192.187.4.23:1230/switch/device/1/on

ip:port/
├──	switch
│	├── device
│	│	├── id
│	│	│	├ on
│	│	│	├ off
│	│	│	└ toggle
│	│	└── all
│	│		├ on
│	│		├ off
│	│		└ toggle 
│	├── group
│	│	├── id
│	│	│	├ on
│	│	│	├ off
│	│	│	└ toggle
│	│	└── all
│	│		├ on
│	│		├ off
│	│		└ toggle
│	└── room
│		├── id
│		│	├ on
│		│	├ off
│		│	└ toggle
│		└── all
│			├ on
│			├ off
│			└ toggle 	
├── send
│	├──	alert
│	│	└── title
│	│		└── message
│	│			└── type
│	└── pushbullet
		└──	
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
+	/devices/active			(GET)		liefert die aktiven Geräte

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
					/DeviceIDEN


***********************************************************************************/
module.exports = function(app, db, plugins){

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
	app.get('/saveSensors', function(req, res){
		var onewire = {
			"protocol": "onewire",
			"switchserver":0
		}
		SwitchServerFunctions.sendto(app, "save", onewire);
		res.status(200).end();
	});
	/*******************************************************************************
	**	Schaltfunktionen	********************************************************
	*******************************************************************************/
	app.get('/switch/:type/:id/:status', function (req, res) {
		var id = req.params.id;
		if(req.params.status == "on" || req.params.status == 1){
			var status = 1;
		}else if(req.params.status == "off" || req.params.status == 0){
			var status = 0;
		}else{
			var status = 'toggle'
		}
		var type = req.params.type;
		switch(type){
			case "device":
				if(id == "all"){
					deviceFunctions.switchDevices(app, status, req, function(data){
						if(!res.headersSent){
							res.json(data);
						}
					});
				}else{
					deviceFunctions.switchDevice(app, id, status, function(data){
						if(!res.headersSent){
							res.json(data);
						}
					});
				}
				break;
			case "group":
				groupFunctions.getGroup(id, function(group){
					if(group == "404"){
						res.json(404);
					}else{
						groupFunctions.switchGroup(app, group, status, function(data){
							if(!res.headersSent){
								res.json(data);
							}
						});
					}
				});
				break;
			case "room":
				roomFunctions.getRoom(id, function(room){
					roomFunctions.switchRoom(room, status, app, function(data){
						if(!res.headersSent){
							res.json(data);
						}
					});
				});
				break;
			default:
				console.log(type);
				if(!res.headersSent){
					res.json(type);
				}
				break;
		}
	});

	app.post('/setDeviceStatus', function(req, res){
		var id = parseInt(req.body.id);
		deviceFunctions.setDeviceStatus(id, req.body.status);
		deviceFunctions.getDevice(id, function(device){
			app.io.emit('change', new message("devices:switch", {"device":device,"status":req.body.status}));
		});
	});
	/*******************************************************************************
	**	alle Geräte	****************************************************************
	*******************************************************************************/
	app.get('/devices', function (req, res) {
		deviceFunctions.getDevices('object', function(data){
			if(!res.headersSent){
				res.json(data);
			}
		});
	});
	
	/*******************************************************************************
	**	Gerät anhand der ID	********************************************************
	*******************************************************************************/
	app.get('/devices/:id', function (req, res) {
		var id = req.params.id;
		switch(id){
			case "active":
				deviceFunctions.activeDevices(function(data){
					res.json(data);
				});
				break;
			default:
				deviceFunctions.getDevice(id, function(data){
					if(!res.headersSent){
						res.json(data);
					}
				});
				break;
		}
	});
	
	/*******************************************************************************
	**	Gerät löschen	************************************************************
	*******************************************************************************/
	app.delete('/devices/:id', function (req, res) {
		var id = req.params.id;
		deviceFunctions.deleteDevice(id, req, res, function(data){
			if(!res.headersSent){
				res.json(data);
			}
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
	// app.post('/devices', function (req, res) {
	// 	deviceFunctions.saveNewDevice(data, req, res, function(data){
	// 		res.json(data);
	// 	});
	// });

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

	app.get('/temperature/reloadTempData', function(req, res){
		variableFunctions.getStoredVariables("all", function(variable){
			app.io.emit('storedVariable', variable);
			if(!res.headersSent){
				res.json(200);
			}
		});
	});

	app.get('/setVariable/:id/:status', function(req, res){
		variableFunctions.setVariable(req.params, app, function(data){
			plugins['timerserver'].send({"setVariable":req.params});
			res.json(data);
		});
	});

	app.post('/setVariable', function(req, res){
		variableFunctions.setVariable(req.body, app, function(data){
			plugins['timerserver'].send({"setVariable":req.body});
			res.json(data);
		});
	});
	app.get('/send/:type/:title/:message/:receiver/:messageType?', function(req, res){
		var data = {};
		data.title = req.params.title;
		data.type = req.params.messageType;
		data.message = req.params.message;
		data.receiver = req.params.receiver;
		data.date = new Date();
		data.id = Math.floor((Math.random() * 100) + 1);
		if(req.params.type.includes(":")){
			data.switchserver = 0;
			SwitchServerFunctions.sendto(app, req.params.type, data);
		}else{
			variableFunctions.replaceVar(data.message, function(message){
				variableFunctions.replaceVar(data.title, function(title){
					data.message = message;
					data.title = title;
					if(req.params.receiver == "all"){
						app.io.emit('change', new helper.message("alerts:add", data));
					}else{
						app.io.in(req.params.receiver).emit('change', new helper.message("alerts:add", data));
					}
					res.status(200).end();
				});
			});
		}
		res.status(200).end();
	});
	/*******************************
		Neuen Countdowntimer anlegen:
		{
			time: 			schaltzeit in timestamp/ms
			device: 		Gerät als Object
			switchstatus: 	Aktion wie geschaltet wird
		}
	*******************************/
	app.post('/countdown', function(req, res){
		var data = {};
		switch(req.data.switchstatus){
			case "on":
			case "ON":
			case "On":
				data.switchstatus = "on";
				break;
			case "off":
			case "OFF":
			case "Off":
				data.switchstatus = "off";
				break;
			case "toggle":
			case "TOGGLE":
			case "Toggle":
				data.switchstatus = "toggle";
				break;
			default:
				helper.log.error("Countdown konnte nicht gespeichert werden! Falsches Argument zum schalten! (on/off/toggle)");
				break;
		}

		if(parseInt(req.data.time) && req.data.time > new Date().getTime()){
			data.time = new Date().getTime() + (  parseInt(req.data.time) * 60000  );
		}

		if(typeof req.data.device == "object"){
			data.device = req.data.device;
		}
		
		countdownFunctions.setNewCountdown(data, function(data){
			if(data != "200"){
				helper.log.error("Countdown konnte nicht gespeichert werden!");
				helper.log.error( data );
			}else{	
				countdownFunctions.getCountdowns(req, res, function(data){
					app.io.emit('countdowns', data);
				});
			}
		});
	});
	app.get('/countdowns/:user', function(req, res){
		countdownFunctions.getCountdowns(req.params.user, function(data){
			if(data){
				res.json(data);
			}else{
				res.json({});
			}
		});
	});
	app.get('/countdown/:id/:user', function(req, res){
		var id = req.params.id;
		countdownFunctions.deleteCountdown(id, function(status){
			if(status == 200){
				app.io.in(req.params.user).emit('change', new message('countdowns:remove', id));
			}
			res.sendStatus(status);
		});
	});
}


function message(type, data){
	var message = {};
	var foo = type.split(':');
	message.masterType = foo[0];
	message.type = foo[1];
	message[foo[1]] = data;
	return message;
}