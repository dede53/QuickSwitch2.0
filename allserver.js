server.jsprocess.env.TZ		=	'Europe/Amsterdam';

var conf 			=	{
	"connair": {
		"ip": "192.168.2.27",
		"port": 49880
	},
	"switchserver": [
		{
			"id":1,
			"ip": "192.168.2.47",
			"port":4040
		},
		{
			"id":2,
			"ip": "192.168.2.185",
			"port":4040
		}
	],
	"QuickSwitch": {
		"ip": "192.168.2.47",	
		"port": 1230
	},
	"homematicIP": "192.168.2.3",
	"fritzbox":{
		"ip":"192.168.2.1",
		"user": "daniel",
		"password": "hallomarcel"
	}
}

var pool      =    mysql.createPool({
	connectionLimit : 100,
	host     : 'localhost',
	user     : 'root',
	password : 'daniel',
	database : 'SmartHome',
	debug    :  false
});

require('events').EventEmitter.prototype._maxListeners = 100;
var mysql			=	require('mysql');
var express			=	require('express.io');
var app				=	express().http().io();
var db				=	require('./app/functions/database.js');
var port			=	process.argv[2] || conf.QuickSwitch.port;

var colors 				= require('colors/safe');
var exec				=	require('exec');
var dgram				=	require('dgram');
var http				=	require('http');
var util				=	require('util');
var exec				=	require('child_process').exec;
var bodyParser			=	require('body-parser');
var cookieParser		=	require('cookie-parser');
var multer				=	require('multer');
var cookies				=	{};




app.use(bodyParser.json()); 						// for parsing application/json
app.use(bodyParser.urlencoded({ extended: true }));	// for parsing application/x-www-form-urlencoded
app.use(multer()); 									// for parsing multipart/form-data
app.use(cookieParser());							// for parsing cookies
app.use(express.static(__dirname + '/public'));		// provides static html




/*********************************************************
* Sendet die der aktiven Geräte
*********************************************************/



function getSensorvalues(id, date, req, res, callback) {
	var query = "
				SELECT time, temp / 100  as temp 
				FROM      sensor_data
				WHERE strftime('%M', time / 1000, 'unixepoch') == '00'
				AND       strftime('%S', time / 1000, 'unixepoch') < '04' 
				AND       strftime('%S', time / 1000, 'unixepoch') >= '00';";
	db.all(query, function(err, row) {
		if (err) {
			console.log(err);
			callback(404);
		} else if (row === "") {
			callback("Keine Daten für den Sensor mit der ID" + id);
			console.log("Keine Daten für den Sensor mit der ID" + id);
		} else {
			callback(row);
		}
	});
}


	var countdownFunctions = require('../functions/countdown.js');
	/*****************************************
	* Socket.io routes für Countdowns
	*
	*
	*
	* Liefert alle Countdowns
	*****************************************/
	app.io.route('countdowns', function(req, res){
		countdownFunctions.getCountdowns(req, res, function(data){
			req.io.emit('countdowns', data);
		});
	});
	/*****************************************
	* legt einen neuen Countdown an
	*****************************************/
	app.io.route('newCountdowntimer', function(req){
		data = req.data;
		data.settime = Math.floor(Date.parse(new Date));

		data.time = data.settime + (data.time * 60000);
		app.io.broadcast('newCountdown', data);
		countdownFunctions.setNewCountdown(req.data, function(data){
			if(data != "200"){
				log("Nachricht konnte nicht gespeichert werden!", "error");
				log( data , "error");
			}
		});
	});
	/*****************************************
	* löscht einen Countdown
	*****************************************/
	app.io.route('deleteCountdown', function(req, res){
		var id = req.data.id;
		countdownFunctions.deleteCountdown(id, req, res, function(data){
			getCountdowns(req, res, function(data){
				app.io.broadcast('countdowns', data);
			});
		});
	});

	var deviceFunctions = require('../functions/device.js');
	var SwitchServerFunctions = require('../functions/SwitchServer.js');
	/*********************************************************
	* Sendet die Gerätefavoriten zu dem neuen Benutzer
	*********************************************************/
	app.io.route('favoritDevices', function( req, res){
		var data = req.data;
		//log(data.name + " hat QuickSwitch geöffnet", "debug");
		
		deviceFunctions.favoritDevices(data, req,res,function(data){
			req.io.emit('favoritDevices', data);
		});
	});

	app.io.route('sendActiveDevices',function(req, res){
		SwitchServerFunctions.sendActiveDevices(app, db, function(err){
			if(err != 200){
				console.log("Error: Liste der aktiven Geräte konnte nicht gesendet werden" + err);
			}
		});
	});


	/*********************************************************
	* Speichert ein Gerät
	*********************************************************/
	app.io.route('saveDevice', function(req, res){
		if( !req.data.deviceid){
			var data = {
				"name": req.data.name,
				"buttonLabelOn": req.data.buttonLabelOn,
				"buttonLabelOff": req.data.buttonLabelOff,
				"CodeOn": req.data.CodeOn,
				"CodeOff": req.data.CodeOff,
				"protocol": req.data.protocol,
				"room": req.data.room,
				"switchserver": req.data.switchserver
			};
			deviceFunctions.saveNewDevice(data, req, res, function(data){
				deviceFunctions.getDevices('object', req, res, function(data){
					app.io.broadcast('devices', data);
				});
			});
		}else{
			var data = 
				{
					"deviceid": req.data.deviceid,
					"name": req.data.name,
					"buttonLabelOn": req.data.buttonLabelOn,
					"buttonLabelOff": req.data.buttonLabelOff,
					"CodeOn": req.data.CodeOn,
					"CodeOff": req.data.CodeOff,
					"protocol": req.data.protocol,
					"room": req.data.room,
					"switchserver": req.data.switchserver
				};
			deviceFunctions.saveEditDevice(data, req, res, function(data){
				deviceFunctions.getDevices('object',req, res, function(data){
					app.io.broadcast('devices', data);
				});
			});
		}
	});

	/*********************************************************
	* Löscht ein Gerät
	*********************************************************/
	app.io.route('deleteDevice', function(req, res){
		var id = req.data.id;
		deviceFunctions.deleteDevice(id, req, res, function(data){
			req.io.emit('deletedDevice', data);
			deviceFunctions.getDevices('object',req, res, function(data){
				app.io.broadcast('devices', data);
			});
		});
	});

	/*********************************************************
	* Liefert die Geräte als Object oder array (var type)
	*********************************************************/
	app.io.route('devices', function(req, res){
		var type = req.data.type;
		deviceFunctions.getDevices(type,req, res, function(data){
			req.io.emit('devices', data);
		});
	});

	/*********************************************************
	* Liefert ein Gerät anhand der ID
	*********************************************************/
	app.io.route('device', function(req, res){
		var id = req.data.id;
		deviceFunctions.getDevice(id, req, res, function(data){
			req.io.emit('device', data);
		});
	});

	/*********************************************************
	* Schaltet alle Geräte
	*********************************************************/
	app.io.route('switchalldevices', function(req, res) {
		var status = req.data.status;
		deviceFunctions.switchDevices(app, status, req, res, function(err){
			if(err != 200){
				console.log(err, "error");
			}
		});
	});

	/*********************************************************
	* Schaltet ein Gerät
	*********************************************************/
	app.io.route('switchdevice', function(req, res){
		var id = req.data.id;
		var status = req.data.status;
		deviceFunctions.switchDevice(app, id, status, req, res, function(err){
			if(err != 200){
				console.log("Gerät konnte nicht geschaltet werden");
			}
		});
	});

	var groupFunctions = require('../functions/group.js');
	/*****************************************
	* Socket.io routes für Gruppen
	*
	*
	*
	* Liefert alle Gruppen mit Name, ID...
	*****************************************/
	app.io.route('groups', function(req, res){
		groupFunctions.getGroups(req, res, function(data){
			req.io.emit('groups', data);
		});
	});
	/*****************************************
	* schickt die Informationen zu einer Gruppe an den Clienten
	*****************************************/
	app.io.route('group', function(req, res){
		var id = req.data.id;
		groupFunctions.getGroup(id, req, res, function(data){
			req.io.emit('group', data);
		});
	});
	/*****************************************
	* Speichert die Gruppe der vom Clienten geliefert wurde
	*****************************************/
	app.io.route('saveGroup', function(req, res){
		if( !req.data.id){
			var data = {
				"name": req.data.name,
				"devices": req.data.groupDevices
			};
			groupFunctions.saveNewGroup(data, req, res, function(data){
				req.io.emit('savedGroup', data);
				groupFunctions.getGroups(req, res, function(data){
					app.io.broadcast('groups', data);
				});
			});
		}else{
			var data = 
				{
					"id": req.data.id,
					"name": req.data.name,
					"devices": req.data.groupDevices
				};
			groupFunctions.saveEditGroup(data, req, res, function(data){
				req.io.emit('savedGroup', data);
				groupFunctions.getGroups(req, res, function(data){
					app.io.broadcast('groups', data);
				});
			});
		}
	});
	/*****************************************
	* Löscht die Gruppe dessen ID vom Clienten kommt
	*****************************************/
	app.io.route('deleteGroup', function(req, res){
		var id = req.data.id;
		groupFunctions.deleteGroup(id, req, res, function(data){
			req.io.emit('deletedGroup', data);
			groupFunctions.getGroups(req, res, function(data){
				app.io.broadcast('groups', data);
			});
		});
	});

	/*****************************************
	* schaltet Gruppen
	*****************************************/
	app.io.route('switchGroup', function(req, res){
		var group = req.data.group;
		var status = req.data.status;
		groupFunctions.switchGroup(app, group, status, req, res, function(err){
			if(err != 200){
				console.log("Gruppe konnte nicht geschaltet werden");
			}
		});
	});

	var messageFunctions = require('../functions/message.js');
	/*****************************************
	* Socket.io routes für Chatnachrichten
	*
	*
	*
	* speichert eine neue Nachricht und sendet sie an alle Teilnehmer
	*****************************************/
	app.io.route('newLinkMessage', function(req){
		req.data.time = Math.floor(Date.parse(new Date));
		console.log(req.data);
		app.io.broadcast('newLinkMessage', req.data);
		messageFunctions.saveMessage(req.data, function(data){
			if(data != "200"){
				log("Nachricht konnte nicht gespeichert werden!", "error");
				log( data , "error");
			}
		});
	});
	/*****************************************
	* lädt ältere Nachrichten aus der Datenbank und schickt sie an den Clienten
	*****************************************/
	app.io.route('loadOldMessages', function(req){
		messageFunctions.loadOldMessages(req.data, function(data){
			console.log("Daten Abfragen!!!!");
			req.io.emit('1234', data);
		});
	});

	var roomFunctions = require('../functions/room.js');
	/*****************************************
	* Socket.io routes für Raumdaten
	*
	*
	*
	*
	* Liefert alle Räume mit Name, ID...
	*****************************************/
	app.io.route('rooms', function(req, res){
		roomFunctions.getRooms(req, res, function(data){
			req.io.emit('rooms', data);
		});
	});
	/*****************************************
	* schickt die Informationen zu einem Raum an den Clienten
	*****************************************/
	app.io.route('room', function(req, res){
		var id = req.data.id;
		roomFunctions.getRoom(id, req, res, function(data){
			req.io.emit('room', data);
		});
	});
	/*****************************************
	* Speichert den Raum der vom CLienten geliefert wurde
	*****************************************/
	app.io.route('saveRoom', function(req, res){
		if( !req.data.id){
			var data = {
				"name": req.data.name
			};
			roomFunctions.saveNewRoom(data, req, res, function(data){
				req.io.emit('savedRoom', data);
				roomFunctions.getRooms(req, res, function(data){
					app.io.broadcast('rooms', data);
				});
			});
		}else{
			var data = 
				{
					"id": req.data.id,
					"name": req.data.name
				};
			roomFunctions.saveEditRoom(data, req, res, function(data){
				roomFunctions.getRooms(req, res, function(data){
					app.io.broadcast('rooms', data);
				});
			});
		}
	});
	/*****************************************
	* Löscht den Raum dessen ID vom Clienten kommt
	*****************************************/
	app.io.route('deleteRoom', function(req, res){
		var id = req.data.id;
		roomFunctions.deleteRoom(id, req, res, function(data){
			req.io.emit('deletedRoom', data);
			roomFunctions.getRooms(req, res, function(data){
				app.io.broadcast('rooms', data);
			});
		});
	});
	app.io.route('switchRoom', function(req, res){
		var room = req.data.room;
		var status = req.data.status;
		roomFunctions.switchRoom(room, status, req, res, function(err){
			if(err != 200){
				console.log("Raum konnte nicht geschaltet werden");
			}
		});
	});

	var deviceFunctions = require('../functions/device.js');

	app.io.broadcast('switchDevice', {"device":data,"status":action});
	
	request.post({
		url:'http://192.168.2.47:4040/switch/',
		form:
			{
				status: action,
				device: data
			}
	},function( err, httpResponse, body){
		if(err){
			log("Error! \n SwitchServer ist nicht erreichbar!", "error");
			log("Sicher das du den SwitchServer gestartet hast?", "info");
			log( err , "error");
		}else{
			log("Erfolgreich an den SwitchServer gesendet", "info");
			deviceFunctions.sendActiveDevices(function(err){
				if(err != 200){
					log("Error: Liste der aktiven Geräte konnte nicht gesendet werden" + err , error);
				}
			});
		}
	});

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
		var sensor = {};
		sensor.id = req.data.id;
		sensor.linetype = req.data.dashStyle;
		sensor.name = req.data.name;
		sensor.charttype = req.data.type;
		sensor.linecolor = req.data.color;
		sensor.nodeid = req.data.nodeid;
		temperatureFunctions.saveSensor(sensor, req, res, function(data){
			console.log(data);
		});
	});
	app.io.route('deleteSensor', function(req, res){
		var id = req.data;
		console.log(req.data);
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
	var userFunctions = require('../functions/user.js');
	/*****************************************
	Socket.io routes für Benutzerbearbeitung
	*****************************************/
	app.io.route('newuser',function(req, res){
		userFunctions.getUsers(req,res,function(data){
			req.io.emit('newuser', data);
		});
	});

	app.io.route('user', function(req, res){
		var id = req.data.id;
		userFunctions.getUser(id, req, res, function(data){
			req.io.emit('user', data);
		});
	});
	app.io.route('saveUser', function(req, res){
		if( !req.data.id){
			var data = {
				"name": req.data.name,
				"favoritDevices": req.data.favoritDevices
			};
			userFunctions.saveNewUser(data, req, res, function(response){
				req.io.emit('savedUser', response);
				userFunctions.getUsers(req, res, function(user){
					app.io.broadcast('newuser', user);
				});
			});
		}else{
			var data = 
				{
					"id": req.data.id,
					"name": req.data.name,
					"favoritDevices": req.data.favoritDevices
				};
			userFunctions.saveEditUser(data, req, res, function(response){
				userFunctions.getUsers(req, res, function(user){
					app.io.broadcast('newuser', user);
				});
			});
		}
	});
	app.io.route('deleteUser', function(req, res){
		var id = req.data.id;
		userFunctions.deleteUser(id, req, res, function(data){
			req.io.emit('deletedUser', data);
			userFunctions.getUsers(req, res, function(data){
				app.io.broadcast('newuser', data);
			});
		});
	});


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
						console.log('Successful: Switch Device with id: ' + id + " to " + status);
						res.json(200);
					}else{
						res.json(data);
					}
				});
				break;
			case "group":
				groupFunctions.getGroup(id, req, res, function(group){
					console.log(group);
					if(group == "404"){
						res.json(404);
					}else{
						groupFunctions.switchGroup(app, group[0], status, req, res, function(data){
							if(data == 200){
								console.log('Successful: Switch Device with id: ' + id + " to " + status);
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
							console.log('Successful: Switch Device with id: ' + id + " to " + status);
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

	array_key_exists: function(key, search) {
		if (!search || (search.constructor !== Array && search.constructor !== Object)) {
			return false;
		}
		return key in search;
	},
	inArray: function(needle, haystack) {
		var length = haystack.length;
		for(var i = 0; i < length; i++) {
			if(haystack[i] == needle) return true;
		}
		return false;
	},
	log: function(msg, type){
		var now = new Date;
		var datum =  now.getDate() + ":" +
		(now.getMonth() + 1) + ":" +
		 now.getFullYear() + " " +
		 now.getHours() + ":" +
		 now.getMinutes() + ":" +
		 now.getSeconds();
		switch(type){
			case "info":
				console.log(datum +': '+ colors.green(msg));
				break;
			case "data":
				console.log(datum +': '+ colors.grey(msg));
				break;
			case "help":
				console.log(datum +': '+ colors.blue(msg));
				break;
			case "debug":
				console.log(datum +': '+ colors.blue(msg));
				break;
			case "warn":
				console.log(datum +': '+ colors.yellow(msg));
				break;
			case "error":
				console.log(datum +': '+ colors.red(msg));
				break;
		}
	}
}

	all : function(query, callback) {
		pool.getConnection(function(err,connection){
			if (err) {
				connection.release();
				console.log({"code" : 100, "status" : "Error in connection database"});
				callback(err);
				// return;
			}

			// console.log('connected as id ' + connection.threadId);

			connection.query(query, function(err,rows){
				connection.release();
				if(!err) {
					callback(err, rows);
				}else{
					console.log(err);
				}
			});

			connection.on('error', function(err) {
				console.log({"code" : 100, "status" : "Error in connection database"});
				callback(err);
				// return;
			});
		});
	},
	run: function(query){
		pool.getConnection(function(err,connection){
			if (err) {
				connection.release();
				console.log({"code" : 100, "status" : "Error in connection database"});
				return;
			}

			console.log('connected as id ' + connection.threadId);

			connection.query(query, function(err,rows){
				connection.release();
			});

			connection.on('error', function(err) {
				console.log({"code" : 100, "status" : "Error in connection database"});
				return;
			});
		});
	},
	each : function(query, callback) {
		pool.getConnection(function(err,connection){
			if (err) {
				connection.release();
				console.log({"code" : 100, "status" : "Error in connection database"});
				callback(err);
				// return;
			}

			console.log('connected as id ' + connection.threadId);

			connection.query(query, function(err,rows){
				connection.release();
				if(!err) {
					rows.forEach(function(row){
						callback(err, row);
					});
				}else{
					console.log(err);
				}
			});

			connection.on('error', function(err) {
				console.log({"code" : 100, "status" : "Error in connection database"});
				callback(err);
				// return;
			});
		});
	}

	sendto: function (app, req, action, data, callback){
		app.io.broadcast('switchDevice', {"device":data,"status":action});
		
		request.post({
			url:'http://' + conf.switchserver[data.switchserver].ip + ':' + 
			conf.switchserver[data.switchserver].port + '/switch/',
			form:
				{
					status: action,
					device: data
				}
		},function( err, httpResponse, body){
			if(err){
				helper.log("Error! \n SwitchServer ist nicht erreichbar!", "error");
				helper.log("Sicher das du den SwitchServer gestartet hast?", "info");
				helper.log( err , "error");
			}else{
				helper.log("Erfolgreich an den SwitchServer gesendet", "info");
				callback(200);
			}
		});
	},
	sendActiveDevices: function (app, db, callback){
		var query = "
				SELECT devices.name, rooms.name AS room 
				FROM devices, rooms WHERE devices.roomid = rooms.id 
				AND status != 0;";
		db.all(query , function(err, activedevices) {
			if (err) {
				console.log(err);
				callback(404);
			}else{
				app.io.broadcast('activedevices', {
					"activedevices": activedevices
				});
				callback(200);
			}
		});
	}
	/*****************************************
	* Liefert alle Countdowns
	*****************************************/
	getCountdowns: function(req,res,callback){
		var query = "
			SELECT countdowns.id,
			countdowntypen.type,
			countdowns.switchid,
			countdowns.time, 
			countdowns.status AS switchstatus
			FROM countdowns, countdowntypen;";
		db.all(query, function(err, row){
			if(err){
				console.log(err);
			}else{
				var bla = new Array;
				async.each(row,
					function(row, callback){
						getDevice(row.switchid, req, res, function(device){
							row.device = device;
							bla.push(row);
							callback();
						});
					},
					function(err){
						if(err){
							console.log(err);
						}else{
							callback(bla);
						}
					}
				);
			}
		});
	},
	/*****************************************
	* löscht einen Countdown
	*****************************************/
	deleteCountdown: function(id, req, res, callback) {
		var query = "SELECT * FROM countdowns WHERE id = " + id + ";";
		db.all(query , function(err, row) {
			if (err) {
				console.log('Error: ' + err);
				callback('Error: ' + err);
			}else if (row == "") {
				callback("300");
				console.log("Kein Countdown mit der ID");
			} else {
				var query = "DELETE FROM countdowns WHERE id = "+ id +";";
				db.all(query ,function(err,rows){
					if(err){
						console.log('Error: ' + err);
						callback('Error: ' + err);
					}else{
						console.log('Delete Countdown with id: ' + id);
						callback("200");
					}
				});
			}
		});
	},
	/*****************************************
	* setzt einen neuen Countdown
		data = {
			time:schaltzeit in timestamp/ms
			device: Gerät als Object
			switchstatus: Aktion wie geschaltet wird
		}

	* Callback: 200 bei erfolg
				error bei fehler
	*****************************************/
	setNewCountdown: function (data, callback){	
		var query = "
			INSERT INTO countdowns (type, time, switchid, status) 
			VALUES ('1','"+ data.time +"','"+ data.device.deviceid +"','"+ data.switchstatus +"');";
		db.all(query, function(err, data){
			if(err){
				callback(err);
			}else{
				callback("200");
			}
		});
	}
		getDevices: function (type, req, res, callback) {
		var query = "SELECT * FROM rooms;";
		if(type == "object"){
			var uff = new Object;
		}else{
			var uff = new Array;
		}
		db.all(query, function(err, row){
			if(err){
				console.log(err);
				callback(404);
			}else{
				async.each(row,
					function(row, callback){
						var query = "
							SELECT rooms.name AS Raum,
							devices.* FROM devices,
							rooms 
							WHERE devices.roomid = '" + row.id + "'     
							AND    devices.roomid = rooms.id;";
						db.all(query , function(err, data) {
							if(err){
								console.log(err);
							}else{
								if(type == "object"){
									uff[row.name] = new Object;
									data.forEach(function(dat){
										uff[row.name][dat.deviceid] = dat;								
									});
								}else{
									// uff[row.name] = new Array;
									data.forEach(function(dat){
										uff.push(dat);							
									});
									
								}
								callback();
							}
						});
					},
					function(err){
						if(err){
							console.log(err);
						}else{
							callback(uff);
						}
					}
				);
			}
		});
	},
	getDevice: function (id, req, res, callback) {
		var query = "
			SELECT 
				devices.*,
				rooms.name AS Raum
			FROM 
				devices,
				rooms 
			WHERE 
				devices.roomid = rooms.id 
			AND 
				devices.deviceid = " + id + ";";
		db.all(query , function(err, row) {
			if (err) {
				console.log(err);
				callback(404);
			}else if(row == ""){
				callback("Kein Gerät mit der ID " + id);
			}else{
				callback(row[0]);
			}
		});
	},
	saveNewDevice: function (data, req, res, callback) {
		var query = "
			INSERT INTO devices ( name, protocol, buttonLabelOn, buttonLabelOff, CodeOn, CodeOff, roomid, switchserver ) 
			VALUES ('"+ data.name +"', '"+ 
				data.protocol +"', '"+ 
				data.buttonLabelOn +"', '"+ 
				data.buttonLabelOff +"', '"+ 
				data.CodeOn +"', '"+ 
				data.CodeOff +"', '"+ 
				data.room +"', '" + 
				data.switchserver + "');";
		db.run(query);
		callback(201);
	},
	saveEditDevice: function (data, req, res, callback) {
		var query = "
			UPDATE 
				devices 
			SET 
				name = '"+ data.name +"', 
				protocol = '"+ data.protocol +"', 
				buttonLabelOn = '"+ data.buttonLabelOn +"', 
				buttonLabelOff = '"+ data.buttonLabelOff +"', 
				CodeOn = '"+ data.CodeOn +"', 
				CodeOff = '"+ data.CodeOff +"', 
				roomid = '"+ data.room +"', 
				switchserver = '" + data.switchserver + "' 
			WHERE 
				deviceid = '"+ data.deviceid +"';";
		db.run(query);
		callback(201);
	},
	deleteDevice: function (id, req, res, callback) {
		var query = "SELECT * FROM devices WHERE deviceid = " + id + ";";
		db.all(query , function(err, row) {
			if (err) {
				console.log('Error: ' + err);
				callback('Error: ' + err);
			}else if (row == "") {
				callback("300");
				console.log("Kein Gerät mit der ID");
			} else {
				var query = "DELETE FROM devices WHERE deviceid = "+ id +";";
				db.all(query ,function(err,rows){
					if(err){
						console.log('Error: ' + err);
						callback('Error: ' + err);
					}else{
						console.log('Delete switch with id: ' + id);
						callback("200");
					}
				});
			}
		});
	},
	switchDevice: function (app, id, status, req, res, callback) {
		var query = "
			SELECT 
				deviceid,
				status, 
				devices.name, 
				protocol, 
				buttonLabelOff, 
				buttonLabelOn, 
				switchserver, 
				CodeOn, 
				CodeOff,
				devices.roomid, 
				rooms.name AS Raum 
			FROM 
				devices,
			 	rooms 
			 WHERE 
			 	deviceid = '" + id + "' 
			 AND 
			 	devices.roomid = rooms.id;";
		db.all(query , function(err, row) {
			if (err) {
				console.log(err);
				callback(404);
			} else {
				SwitchServer.sendto(app, req, status, row[0],function(status){
					if(status == 200){
						SwitchServer.sendActiveDevices(app, db, function(err){
							if(err != 200){
								console.log("Error: Liste der aktiven Geräte konnte nicht gesendet werden" + err);
							}
						});
					}
				});
				var query = "UPDATE devices SET status = '"+ status +"' WHERE deviceid = "+ id +";";
				db.run(query);
				callback(200);
			}
		});
	},
	switchDevices: function (app, status, req, res, callback) {
		var query = "
			SELECT 
				deviceid, 
				status, 
				devices.name, 
				protocol, 
				buttonLabelOff, 
				buttonLabelOn, 
				switchserver, 
				CodeOn, 
				CodeOff, 
				devices.roomid, 
				rooms.name AS Raum 
			FROM 
				devices,
				rooms 
			WHERE 
				devices.roomid = rooms.id 
			AND 
				status != " + status + ";";
		db.all(query , function(err, row) {
			if (err) {
				log(err, "error");
				callback(404);
			} else {
				row.forEach(function(device){
					SwitchServer.sendto(app, req, status, device,function(status){
						if(status == 200){
							SwitchServer.sendActiveDevices(app, db, function(err){
								if(err != 200){
									console.log("Error: Liste der aktiven Geräte konnte nicht gesendet werden" + err);
								}
							});
						}
					});
					var query = "
						UPDATE devices SET status = '"+ status +"' 
						WHERE deviceid = "+ device.deviceid +";";
					db.run(query);
				});
				callback(200);
			}
		});
	},
	favoritDevices: function (data, req, res, callback){
		var favoritDevices = JSON.parse(data.favoritDevices);
		// console.log(favoritDevices);
		if(favoritDevices == ""){
			console.log("Keine Geräte gewählt!");
		}else{
			var devices = new Object;
			var string = "";
			favoritDevices.forEach(function(dev){
				if(string == ""){
					string = " deviceid = " + dev;
				}else{
					string = string + " OR  deviceid = " + dev;
				}
			});
			var query = "
				SELECT devices.*, rooms.name AS room 
				FROM devices, rooms 
				WHERE devices.roomid = rooms.id AND ("+ string +");";
			db.all(query , function(err, data) {
				if(err){
					console.log(err);
				}else{
					data.forEach(function(device){
						devices[device.deviceid] = device;
					});
					callback(devices);
				}
			});
		}
	}
	switchGroup: function(app, group, status, req, res, callback){
		var groupDevices = JSON.parse(group.groupDevices);
		var devices = new Object;
		var string = "";
		groupDevices.forEach(function(dev){
			if(string == ""){
				string = " deviceid = " + dev;
			}else{
				string = string + " OR  deviceid = " + dev;
			}
		});
		var query = "SELECT * FROM devices WHERE "+ string +";";
		db.all(query , function(err, data) {
			if(err){
				console.log(err);
				callback(404);
			}else{
				data.forEach(function(device){
					SwitchServer.sendto(app, req, status, device, function(data){
						console.log(data);
					});
					var query = "UPDATE devices SET status = '"+ status +"' 
						WHERE deviceid = "+ device.deviceid +";";
					db.run(query);
				});
				callback(200);
			}
		});
	},
	getGroups: function(req, res, callback){
		var query = "SELECT id, name, devices as groupDevices FROM groups;";
		db.all(query, function(err, data){
			if(err){
				callback(404);
				console.log(err);
			}else{
				callback(data);
			}
		});
	},
	getGroup: function(id, req, res, callback){
		var query = "SELECT id, name, devices as groupDevices 
			FROM groups WHERE id = " + id + ";";
		db.all(query, function(err, data){
			if(err){
				console.log(err);
				callback(404);
			}else if(data == ""){
				console.log("Keine Gruppe mit der ID: " + id);
				callback(404);
			}else{
				callback(data);
			}
		});
	},
	saveNewGroup: function(data, req, res, callback){
		var query = "INSERT INTO groups (name, devices) 
			VALUES ('" + data.name + "', '["+ data.devices +"]');";
		db.run(query);
		callback(201);
	},
	saveEditGroup: function(data, req ,res, callback){
		console.log(data);
		var query = "UPDATE groups 
			SET name = '" + data.name + "',
				devices = '["+ data.devices +"]' 
			WHERE id = '" + data.id + "';";
		db.run(query);
		callback(201);
	},
	deleteGroup: function(id, req, res, callback){
		var query = "DELETE FROM groups WHERE id = '" + id + "';";
		db.all(query, function(err, data){
			if(err){
				callback(err);
			}else{
				callback("200");
			}
		});
	}

	saveMessage: function (data, callback){
		var query = "INSERT INTO messages (time, type, author, message) 
			VALUES ('"+ data.time +"','"+ data.type +"','"+ data.author +"','"+ data.message +"');";
		db.all(query, function(err, data){
			if(err){
				callback(err);
			}else{
				callback("200");
			}
		});
	},
	sendMessages: function (callback){
		var query = "
			SELECT time, type, author, message 
			FROM messages 
			WHERE time >= ( " + data + " - 86400 ) 
			AND time <=  UNIX_TIMESTAMP(NOW()) * 1000;";
		db.all(query , function(err, messages) {
			if (err) {
				console.log(err);
				callback(404);
			}else{
				callback(messages);
			}
		});
	},
	loadOldMessages: function (data, callback){
		var query = "
			SELECT time, type, author, message 
			FROM messages 
			WHERE time < '" + data + "' ORDER BY time DESC LIMIT 1;";
		db.all(query, function(err, messages){
			if (err) {
				console.log(err);
			}else{
				console.log(messages);
				var messagesToSend = new Object;
				messagesToSend.messages = messages;

				if(messages == ""){
					messagesToSend.moreMessagesAvible = false;
				}else{
					messagesToSend.moreMessagesAvible = true;
				}
				callback(messagesToSend);
			}
		});
	}
	switchRoom: function (room, status, req, res, callback){
		var query = "
			SELECT 
				deviceid, 
				status, 
				devices.name, 
				protocol, 
				buttonLabelOff, 
				buttonLabelOn, 
				CodeOn, 
				CodeOff, 
				devices.roomid, 
				rooms.name AS Raum 
			FROM 
				devices,
			 	rooms 
			WHERE 
				roomid = '" + room.id + "' 
			AND 
				devices.roomid = rooms.id;";
		db.all(query , function(err, row) {
			if (err) {
				console.log(err);
				callback(404);
			} else {
				row.forEach(function(device){
					SwitchServer.sendto(app, req, status, device, function(data){
						console.log(data);
					});
				});
				var query = "
					UPDATE devices SET status = '"+ status +"' 
					WHERE roomid = "+ room.id +";";
				db.run(query);
				callback(200);
			}
		});
	},
	getRooms: function (req,res, callback){
		var query = "SELECT * FROM rooms;";
		db.all(query, function(err, data){
			if(err){
				console.log(err);
			}else{
				callback(data);
			}
		});
	},
	getRoom: function (id, req, res, callback){
		var query = "SELECT * FROM rooms WHERE id = "+ id +";";
		db.all(query, function(err, data){
			if(err){
				console.log(err);
			}else if(data == ""){
				console.log("Kein Raum mit der ID: " + id);
			}else{
				callback(data);
			}
		});
	},
	saveNewRoom: function (data, req, res, callback) {
		var query = "INSERT INTO rooms ( name) VALUES ('"+ data.name +"');";
		console.log(query);
		db.run(query);
		callback(201);
	},
	saveEditRoom: function (data, req, res, callback) {
		var query = "UPDATE rooms SET name = '"+ data.name +"' WHERE id = '"+ data.id +"';";
		db.run(query);
		callback(201);
	},
	deleteRoom: function (id, req, res, callback) {
		var query = "DELETE FROM rooms WHERE id = "+ id +";";
		db.all(query ,function(err,rows){
			if(err){
				console.log('Error: ' + err);
				callback('Error: ' + err);
			}else{
				callback("200");
			}
		});
	}

	/*****************************************
	* Liefert alle User als Callback
	*****************************************/
	getUsers: function (req, res, callback){
		var query = "SELECT * FROM user;";
		db.all(query, function(err, row){
			if(err){
				console.log(err);
			}else{
				callback(row);
			}
		});
	},
	/*****************************************
	* liefert einen User als Callback
	* Argument: userID
	*****************************************/
	getUser: function (id, req, res, callback){
		var query = "SELECT * FROM user WHERE id = " + id + ";";
		db.all(query , function(err, row) {
			if (err) {
				console.log(err);
				callback(404);
			}else if(row == ""){
				callback("Kein Benutzer mit der ID" + id);
				console.log("Kein Benutzer mit der ID" + id);
			}else{
				callback(row);
			}
		});
	},
	/*****************************************
	* löscht einen User
	* Callback: Error
				200 bei Erfolg
				300 bei nicht vorhandenem User
	* Argument: userID
	*****************************************/
	deleteUser: function (id, req, res, callback) {
		var query = "SELECT * FROM user WHERE id = " + id + ";";
		db.all(query , function(err, row) {
			if (err) {
				console.log('Error: ' + err);
				callback('Error: ' + err);
			}else if (row == "") {
				callback("300");
				console.log("Kein User mit der ID");
			} else {
				var query = "DELETE FROM user WHERE id = "+ id +";";
				db.all(query ,function(err,rows){
					if(err){
						console.log('Error: ' + err);
						callback('Error: ' + err);
					}else{
						console.log('Delete User with id: ' + id);
						callback("200");
					}
				});
			}
		});
	},
	/*****************************************
	* speichert einen neuen User
	* Callback: 201
	*****************************************/
	saveNewUser: function (data, req, res, callback) {
		var query = "
			INSERT INTO user ( name, favoritDevices ) 
			VALUES ('"+ data.name +"', '["+ data.favoritDevices +"]');";
		db.run(query);
		callback(201);
	},
	/*****************************************
	* ändert einen schon vorhandenen User
	*****************************************/
	saveEditUser: function (data, req, res, callback) {
		var query = "
			UPDATE user 
			SET name = '"+ data.name +"', 
				favoritDevices = '["+ data.favoritDevices +"]' 
			WHERE 
				id = '"+ data.id +"';";
		console.log(query);
		db.run(query);
		callback(201);
	}

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
		if(!data.timestamp){	
			var now = Math.floor(Date.parse(new Date));
		}else{
			var now = data.timestamp;
			console.log("Timestamp geliefert..");
		}

		if(data.hum != ""){
			var query = "
				INSERT INTO sensor_data ( nodeID, supplyV, temp, hum, time)
				VALUES (
					'"+ data.nodeID +"', '"+
					data.supplyV +"', '"+
					data.temp +"', '"+
					data.hum +"', '"+
					now +"'
				);";
		}else{
			var query = "
				INSERT INTO sensor_data ( nodeID, supplyV, temp, time)
				VALUES (
					'"+ data.nodeID +"', '"+
					data.supplyV +"', '"+ 
					data.temp +"', '"+ 
					now +"'
				);";
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
		var query = "
			SELECT 
				sensors.id, 
				sensors.name, 
				sensors.nodeid, 
				sensors.linetype, 
				sensors.linecolor 
			FROM 
				sensors 
			AND id = " + id + ";";
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
			var query = "
				UPDATE sensors 
				SET name = '" + data.name + "', 
					nodeid = " + data.nodeid + ", 
					charttype = '" + data.charttype + "', 
					linetype = '" + data.linetype + "', 
					linecolor = '" + data.linecolor + "' 
				WHERE id = " + data.id + ";";
		}else{
			var query = "
				INSERT INTO sensors (name, nodeid, charttype, linetype, linecolor) 
				VALUES ('" + data.name + "', '" + data.nodeid + "', '" + data.charttype + "', '" + data.linetype + "', '" + data.linecolor + "');";
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


		var query ="
			SELECT 
				sensors.nodeID 	AS nodeID, 
				sensors.name AS name, 
				sensors.linecolor AS farbe, 
				charttype, 
				linetype 
			FROM sensors;";
		db.all(query, function(err, sensor){
			if(err){
				console.log(err);
			}else{
				var alldata = new Array;
				async.each(sensor,
					function(sensor, callback){
						var query = "
							SELECT nodeid, time, temp / 100 as temp, ROUND(time / 1000) as timestamp 
							FROM sensor_data 
							WHERE nodeid = '" + sensor.nodeID + "' 
							AND (time/1000) <= UNIX_TIMESTAMP() 
							AND (time/1000) >= UNIX_TIMESTAMP(DATE_SUB(NOW(), INTERVAL 36 hour)) 
							GROUP BY (ROUND(timestamp/3600)*3600) 
							ORDER BY time ASC;";

						
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
								
								alldata.push(data);
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
	saveSensors : function(){
		console.log("Lese Temperaturen...");
		bus.listAllSensors().then(function(data){
			if(data.err){
				console.log(data);
			}else{
				var opt_measureType = "temperature";
				data.ids.forEach(function(sensor){
					bus.getValueFrom(sensor, opt_measureType).then(function(res){
						if(res.err){
							console.log(res);
						}else{
							res.result.id = sensor;
							res.result.value = Math.round(res.result.value * 100);
							
							// Ausgelesene Daten an die Datenbank schicken
							request.post({
								url:'http://' + conf.QuickSwitch.ip + ':' + conf.QuickSwitch.port + '/newdata/',
								form:
									{
										nodeID : res.result.id,
										supplyV : 2.2,
										temp : res.result.value,
										timestamp : res.result.timestamp
									}
							},function( err, httpResponse, body){
								if(err){
									console.log( err );
								}else{
									console.log( res.result.id + " gespeichert!");
								}
							});
						}
					});	
				});
			}
		});
	}
// Start server
app.listen(port);
helper.log("Server running at http://127.0.0.1:" + port + "/", "info");