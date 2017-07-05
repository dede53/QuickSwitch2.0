#!/usr/bin/env node
var server;
var errors					=	[];
var sockets					=	[];
var plugins 				=	{};
var allTimers				=	{};
var allVariables			=	{};
var allSwitchServers		=	{};
var allDevices				=	{};
var logFiles				=	{};

var express					=	require('express.oi');
var fs						=	require('fs');
var fork					=	require('child_process').fork;
var bodyParser				=	require('body-parser');
var cookieParser			=	require('cookie-parser');
var crypto					=	require('crypto');
var request 				=	require('request');

var config					=	require("./config.json");
var db						=	require('./app/functions/database.js');
var createVariable			=	require('./app/functions/newVariable.js');
var createTimer				=	require('./app/functions/newTimer.js');
var createObject			=	require('./app/functions/newObject.js');
if(config.useHTTPS){
	var options = {
		key: fs.readFileSync('./key.pem'),
		cert: fs.readFileSync('./cert.pem')
	}
	var app						=	express().https(options).io();
}else{
	var app						=	express().http().io();
}


// app.use(express.logger('dev'));
app.use(bodyParser.json()); 						// for parsing application/json
app.use(bodyParser.urlencoded({ extended: true }));	// for parsing application/x-www-form-urlencoded
app.use(cookieParser());							// for parsing cookies
app.use(express.static(__dirname + '/public'));		// provides static htmls
logFiles.master				=	fs.createWriteStream( "./log/debug-master.log", {flags : 'w'});

if(!fs.existsSync("./log")){
	fs.mkdirSync("./log", 0766, function(err){
		if(err){
			log.debug("mkdir ./log: failed: " + err);
		}
	});
}

var log = {
	"info": function(data){
		if(config.loglevel == 1 ){
			newMessage(1,data);
		}
	},
	"debug": function(data){
		if(config.loglevel <= 2){
			newMessage(2,data);
		}
	},
	"warning": function(data){
		if(config.loglevel <= 3){
			newMessage(3,data);
		}
	},
	"error": function(data){
		if(config.loglevel <= 4){
			newMessage(4,data);
		}
	},
	"pure": function(data){
		newMessage(data);
	}
}

function newMessage(type, message){
	var now = new Date;
	var datum =  now.getDate() + "." + (now.getMonth() + 1) + "." + now.getFullYear() + " " + now.getHours() + ":" + now.getMinutes() + ":" + now.getSeconds() + ":" + now.getMilliseconds();
	
	if(typeof message === "object"){
		var message = JSON.stringify(message);
	}else{
		var message = message.toString();
	}
	var data = {
		"time": datum,
		"message": message,
		"type":type
	};
	logFiles.master.write(datum +":"+ message + "\n");
	console.log(datum +":"+ message);
	errors.push(data);
	if(errors.length > 100){
		errors.splice(0,1);
	}
	app.io.emit("serverError", data);
}


// var loadDevices = function(){
// 	var query = "SELECT devices.*, rooms.name AS Raum FROM devices, rooms WHERE devices.roomid = rooms.id;";
// 	db.all(query , function(err, row) {
// 		if (err) {
// 			log.error(err);
// 		}else{
// 			row.forEach(function(device){
// 				allDevices[device.deviceid] = new createObject(device, config.switchserver, app);
// 			});
// 			console.log("Alle Objecte geladen");
// 		}
// 	});
// }
var allObjects = function(){
var query = "SELECT * FROM objects;";
var that = this;
	db.all(query , function(err, row) {
		if (err){
			log.error(err);
		}else{
			for(var obj in row){
				var object = row[obj];
				that[object.id] = new createObject(object, config.switchserver);
			};
			for(var obj in row){
				var object = row[obj];
				if(object.type == "enum"){
					that[object.id].data.listItems = {};
					that[object.id].data.list.forEach(function(itemId){
						that[object.id].data.listItems[itemId] = allObjects[itemId];
					});
				}
			}
			// console.log(that[14].data.listItems[15].data.listItems);
			console.log("Alle Objecte geladen");
			// return that;
		}
	});
}

allObjects.prototype.get = function(id){
	if(this[id].type == "enum"){
		this[id].data.list.forEach(function(itemId){
			this[id].data.listItems[itemId] = this[itemId];
		});
	}
	return this[id];
}

function loadVariables(){
	var query = "SELECT * FROM variable;";
	db.all(query, function(err, variables){
		if(err){
			log.debug(err);
			return;
		}
		variables.forEach(function(variable){
			allVariables[variable.id] = new createVariable(variable);
		});
		console.log("Alle Variablen geladen");
	});
}

var allObjects = new allObjects();
loadVariables();

app.get('/pc', function(req, res) {
	res.sendfile(__dirname + '/public/pc/index.html');
});

app.get('/settings', function(req, res) {
	res.sendfile(__dirname + '/public/settings/index.html');
});

app.get('/mobile', function(req, res) {
	res.sendfile(__dirname + '/public/mobile/index.html');
});

app.get('/mobil', function(req, res) {
	res.redirect('/mobile');
});

app.get('/tablet', function(req, res) {
	res.sendfile(__dirname + '/public/tablet/index.html');
});

app.get('/', function(req, res) {
	res.sendfile(__dirname + '/public/index.html');
});

app.io.on('connect', function(req){
	log.debug("Neuer Client verbunden: " + req.id);
})
startServer();
startDependend([
	// "SwitchServer/adapter.js",
	"countdownserver.js",
	"timerserver.js"
]);

require('./app/routes.js')(app, db, plugins);
require('./app/ioroutes/device.js')(app, db, plugins, errors, log, allObjects, allVariables);


function stopDependend(data){
	for (var i = 0;	i > data.length; i++) {
		plugins[data[i]].kill('SIGHUP');
	}
}

function startDependend(data){
	// Andere Dateien starten
	// data.forEach(function(file){
	for(var file in data){
		var file = data[file];
		var splitedfile 			= file.split(".");
		if(splitedfile[0].includes("/")){
			var name 				= splitedfile[0].split("/");
			var filename 			= name[name.length - 1].toLowerCase();
		}else{
			var filename 			= splitedfile[0];
		}
		var debugFile 				= __dirname + '/log/debug-' + filename + '.log';
		logFiles[filename]			=	fs.createWriteStream( debugFile, {flags : 'w'});
		plugins[filename] 			= fork( './' + file);

		plugins[filename].on('message', function(response) {
			if(response.log){
				var now = new Date;
				var datum =  now.getDate() + "." + (now.getMonth() + 1) + "." + now.getFullYear() + " " + now.getHours() + ":" + now.getMinutes() + ":" + now.getSeconds();
				
				logFiles[filename].write(datum +":"+response.log + "\n");
				log.debug(response.log);
			}
			if(response.setVariable){
				plugins.timerserver.send({"setVariable":response.setVariable});
				variableFunctions.setVariable(response.setVariable, app, function(status){});
			}
			if(response.room){
				roomFunctions.switchRoom(response.room, response.room.switchstatus, app, function(err){
					if(err != 200){
						log.debug(err + "Raum konnte nicht geschaltet werden");
					}
				});
			}
			if(response.group){
				groupFunctions.switchGroup(app, response.group, response.group.switchstatus, function(err){
					if(err != 200){
						log.debug( err + ":Die Gruppe mit der ID " + req.data.switch.group.id + " konnte nicht geschaltet werden!");
					}
				});
			}
			if(response.device){
				allDevices[response.device.action.deviceid].switch(response.device.switchstatus, app);
			}
			if(response.url){
				if(response.url.timeout != ""){
					setTimeout(function(){
						request(response.url.url, function (err, response, body) {
							if (err) {
								log.error(err);
							}
						});
					}, response.url.timeout * 1000);
				}else{
					request(response.url.url, function (err, response, body) {
						if (err) {
							log.error(err);
						}
					});
				}
			}
			if(response.alert){
				var data = response.alert;
				if(!data.date){
					data.date = new Date();
				}
				if(!data.id){
					data.id = Math.floor((Math.random() * 100) + 1);
				}
				variableFunctions.replaceVar(data.message, function(content){
					variableFunctions.replaceVar(data.title, function(title){
						data.message = content;
						data.title = title;
						if(data.user == "all"){
							app.io.emit('change', new message("alerts:add", data));
						}else{
							app.io.in(data.user).emit('change', new message("alerts:add", data));
						}
					});
				});
			}
			if(response.saveSensors){
				// log.debug("Sensoren speichern");
				// var onewire = {
				// 	"protocol": "onewire",
				// 	"switchserver":response.saveSensors.switchServer
				// }
				// console.log(config.switchserver);
				// console.log(response.saveSensors);
				// request.post({
				// 	url:'http://' + config.switchserver[response.saveSensors.switchServer].ip + ':' + config.switchserver[response.saveSensors.switchServer].port + '/switch',
				// 	form:{
				// 		"protocol": "onewire",
				// 		"switchserver":response.saveSensors.switchServer
				// 	}
				// },function( err, httpResponse, body){
				// 	if(err){
				// 		log.error("Error! \n SwitchServer ist nicht erreichbar!");
				// 		log.error(err);
				// 	}else{
				// 		if(body !== '200'){
				// 			log.error("Der SwitchServer [" + config.switchserver[response.saveSensors.switchServer].ip + ':' + config.switchserver[response.saveSensors.switchServer].port + "] meldet einen Fehler mit dem Adapter: " + action);
				// 			if(callback){
				// 				callback(body);
				// 			}
				// 			return;
				// 		}else{
				// 			if(callback){
				// 				callback(data);
				// 			}
				// 		}
				// 	}
				// });
			}
			if(response.setDeviceStatus){
				var id = parseInt(response.setDeviceStatus.id);
				deviceFunctions.setDeviceStatus(id, response.setDeviceStatus.status);
				deviceFunctions.getDevice(id, function(device){
					app.io.emit('change', new message("devices:switch", {"device":device,"status":response.setDeviceStatus.status}));
				});
			}
			if (response.getUserTimers){
				response.req.socket.emit('change', new message('timers:get', response.getUserTimers));
			}
		});
	// });
	}
}

function message(type, data){
	var message = {};
	var foo = type.split(':');
	message.masterType = foo[0];
	message.type = foo[1];
	message[foo[1]] = data;
	return message;
}

function startServer(port, callback){
	var port = port || config.QuickSwitch.port || 1230;
	try{
		server = app.listen(port, function(){
			log.debug("Der Server wurde erfolgreich gestartet!", port);
			if(callback){
				callback(200);
			}
		});
		server.on('connection', function(socket){
			sockets.push(socket);
		});
	}catch(e){
		if(callback){
			callback(404);
		}
		log.debug(e);
	}
}

function stopServer(callback){
	try{
		log.debug("Der Server wurde gestoppt!");
		server.close();
		for(var i=0; i < sockets.length; i++){
			sockets[i].destroy();
		}
		log.debug("Der Server wurde gestoppt!");
		if(callback){
			callback(200);
		}
	}catch(e){
		log.debug("Fehler: Der Server konnte nicht gestoppt werden!");
		log.debug(e);
		if (callback){
			callback(404);
		}
	}
}


process.on('SIGINT', function(code){
	stopServer();
	stopDependend([
		"timerserver.js",
		"countdownserver.js",
		// "SwitchServer/adapter.js",
	]);
	process.exit(1);
});

setTimeout(function(){
	// console.log(allObjects);
	// allObjects.get('1');
	allObjects['14'].switch("toggle", app, function(){
		console.log("geschaltet");
	});
}, 5000);