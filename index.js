#!/usr/bin/env node

var express					=	require('express.oi');

var fs						=	require('fs');
var fork					=	require('child_process').fork;
var bodyParser				=	require('body-parser');
var cookieParser			=	require('cookie-parser');
var crypto					=	require('crypto');

var config					=	require("./config.json");
var switchServerFunctions	=	require('./app/functions/SwitchServer.js');
var db						=	require('./app/functions/database.js');
var countdownFunctions		=	require('./app/functions/countdown.js');
var deviceFunctions			=	require('./app/functions/device.js');
var groupFunctions			=	require('./app/functions/group.js');
var messageFunctions		=	require('./app/functions/message.js');
var roomFunctions			=	require('./app/functions/room.js');
var timerFunctions			=	require('./app/functions/timer.js');
var userFunctions			=	require('./app/functions/user.js');
var adapterFunctions		=	require('./app/functions/adapter.js');
var variableFunctions		=	require('./app/functions/variable.js');
var createVariable			=	require('./app/functions/newVariable.js');
var createTimer				=	require('./app/functions/newTimer.js');
var createAlerts 			=  	require('./app/functions/newAlerts.js');

var server;
var errors					=	[];
var sockets					=	[];
var allTimers				=	{};
var allVariables			=	{};
var logFiles				=	{};
var plugins 				=	{};
log = {
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
			if(typeof data == 'object'){
				switch(data.code){
					case "EHOSTUNREACH":
						newMessage(4, "Ziel nicht erreichbar: " + data.address + ":" + data.port);
						break;
					case "ECONNREFUSED":
						newMessage(4, "Ziel hat die Anfrage abgelehnt: " + data);
						break;
					default:
						newMessage(4,data.code + ":" + data.address+ ":" + data.port);
						break;
				}
			}else{
				newMessage(4,data);
			}
		}
	},
	"pure": function(data){
		newMessage(data);
	}
}

var later 					=	require('later');
var request					=	require('request');
logFiles.master				=	fs.createWriteStream( "./log/debug-master.log", {flags : 'w'});
var allIntervals			=	{
									setInterval: function(id, callback, sched){
										this.intervals[id] = later.setInterval(callback, sched);
									},
									clearInterval: function(id){
										this.intervals[id].clear();
										delete this.intervals[id];
									},
									intervals: {}
								};

if(config.useHTTPS){
	var options = {
		key: fs.readFileSync('./key.pem'),
		cert: fs.readFileSync('./cert.pem')
	}
	var app						=	express().https(options).io();
}else{
	var app						=	express().http().io();
}

var allAlerts = {
	add: function(alert){
		alert.id = Math.floor((Math.random() * 100) + 1);
		if(!this.alerts[alert.user]){
			this.alerts[alert.user] = {};
		}
		this.alerts[alert.user][alert.id] = new createAlerts(alert);
		this.alerts[alert.user][alert.id].show(app);
	},
	remove: function(alert){
		var that = this;
		if(this.alerts[alert.user] && this.alerts[alert.user][alert.id]){
			this.alerts[alert.user][alert.id].remove(app, function(){
				delete that.alerts[alert.user][alert.id];
			});
		}else{
			app.io.in(alert.user).emit('change', new message('alerts:remove', alert.id));
		}
	},
	removeAll: function(user){
		var alerts = Object.keys(this.alerts[user] || new Array());
		var that = this;
		alerts.forEach(function(alert){
			if(that.alerts[user] && that.alerts[user][alert]){
				that.alerts[user][alert].remove(app, function(){
					delete that.alerts[user][alert];
				});
			}else{
				app.io.in(user).emit('change', new message('alerts:remove', alert));
			}
		});
	},
	addAll: function(alert){
		userFunctions.getUsers(function(users){
			users.forEach(function(user){
				if(alert.toAdmin){
					if(user.admin == true || user.admin == "true"){
						alert.user = user.name;
						allAlerts.add(alert);
					}
				}else{
					alert.user = user.name;
					allAlerts.add(alert);
				}
			});
		});
	},
	alerts: {}
}
// allAlerts.add({
// 	user:"Daniel",
// 	title:"Moin",
// 	message:"Arbeitet das?",
// 	type:"info"
// });
// allAlerts.addAll({
// 	title:"Moin",
// 	message:"Arbeitet das bei euch?",
// 	type:"info"
// });


// app.use(express.logger('dev'));
app.use(bodyParser.json()); 						// for parsing application/json
app.use(bodyParser.urlencoded({ extended: true }));	// for parsing application/x-www-form-urlencoded
app.use(cookieParser());							// for parsing cookies
app.use(express.static(__dirname + '/public'));		// provides static htmls

if(!fs.existsSync("./log")){
	fs.mkdirSync("./log", 0766, function(err){
		if(err){
			log.debug("mkdir ./log: failed: " + err);
		}
	});
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
	if(type == 4){
		allAlerts.addAll({
			title: "Servererror!",
			message: message,
			type: "danger",
			toAdmin: true
		});
		// app.io.emit("serverError", data);
	}
}


loadVariables();
// loadTimers();

app.get('/pc', function(req, res) {
	res.sendFile(__dirname + '/public/pc/index.html');
});

app.get('/settings', function(req, res) {
	res.sendFile(__dirname + '/public/settings/index.html');
});

app.get('/mobile', function(req, res) {
	res.sendFile(__dirname + '/public/mobile/index.html');
});

app.get('/mobil', function(req, res) {
	res.redirect('/mobile');
});

app.get('/tablet', function(req, res) {
	res.sendFile(__dirname + '/public/tablet/index.html');
});

app.get('/test', function(req, res) {
	res.sendFile(__dirname + '/public/test/mobile.html');
});

app.get('/test1', function(req, res) {
	res.sendFile(__dirname + '/public/test/pc.html');
});

app.io.on('connect', function(socket){
	log.debug("Neuer Client verbunden: " + socket.id);
	socket.on('disconnect', function(reason){
		log.debug("Client getrennt: " + socket.id);
	})
})

app.io.route('settings', {
	get: function(req){
		req.socket.emit('change', new message('settings:get', config));
	},
	save: function(req){
		fs.writeFile(__dirname + "/config.json", JSON.stringify(req.data), 'utf8', function(err){
			if(err){
				log.error("Die Einstellungen konnten nicht gespeichert werden!");
				log.error(err);
			}else{
				// db	=	require('./app/functions/database.js');
				app.io.emit('change', new message('settings:get', req.data));
				if(req.data.mysql != config.mysql || req.data.QuickSwitch != config.QuickSwitch){
					log.error("Die Einstellungen wurden geändert! Die Haussteuerung ist nun unter folgender addresse zu erreichen: <a href='http://"+req.data.QuickSwitch.ip +":"+req.data.QuickSwitch.port+"'>QuickSwitch</a>");
					stopServer(function(){
						startServer(req.data.QuickSwitch.port);
					});
				}
				config = req.data;
			}
		});
	},
	errors: function(req){
		req.socket.emit('serverErrors', errors);
	}
});

startServer();
startDependend([
	// "SwitchServer/adapter.js",
	"countdownserver.js",
	"timerserver.js"
]);

require('./app/routes.js')(app, db, plugins, allAlerts);
require('./app/ioroutes/device.js')(app, db, plugins, errors, log, allAlerts);


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
			// console.log(response);
			if(response.setVariable){
				// Workaround, notwendig? Kein Ahnung 04.09.17
				if(response.setVariable.action){
					variableFunctions.setVariable(response.setVariable.action, app, function(status){});
					plugins['timerserver'].send({"setVariable":response.setVariable.action});
				}else{
					variableFunctions.setVariable(response.setVariable, app, function(status){});
					plugins['timerserver'].send({"setVariable":response.setVariable});
				}
				// plugins.timerserver.send({"setVariable":response.setVariable});
			}
			if(response.room){
				roomFunctions.switchRoom(response.room.action, response.room.switchstatus, app, function(err){
					if(err != 200){
						log.debug(err + "Raum konnte nicht geschaltet werden");
					}
				});
			}
			if(response.group){
				groupFunctions.switchGroup(app, response.group.action, response.group.switchstatus, function(err){
					if(err != 200){
						log.debug( err + ":Die Gruppe mit der ID " + req.data.switch.group.id + " konnte nicht geschaltet werden!");
					}
				});
			}
			if(response.device){
				deviceFunctions.switchDevice(app, response.device.action.deviceid, response.device.switchstatus, function(err){
					if(err != 200){
						log.debug( "Gerät mit der ID " + response.device.action.deviceid + " konnte nicht geschaltet werden!");
					}
				});
			}
			if(response.url){
				var action = response.url;
				if(parseInt(action.timeout)){
					setTimeout(function(){
						request(action.action.url, function (err, response, body) {
							if (err) {
								log.error(err);							}
						});
					}, action.timeout * 1000);
				}else{
					request(action.action.url, function (err, response, body) {
						if (err) {
							log.error(err);
						}
					});
				}
			}
			if(response.alert){
				var data = response.alert.action;
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
							allAlerts.addAll(data);
						}else{
							allAlerts.add(data);
						}
					});
				});
			}
			if(response.saveSensors){
				log.debug("Sensoren speichern");
				var onewire = {
					"protocol": "onewire",
					"switchserver":0
				}
				switchServerFunctions.sendto(app, "save", onewire);
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

function loadVariables(){
	var query = "SELECT * FROM variable;";
	db.all(query, function(err, variables){
		if(err){
			log.debug(err);
			return;
		}
		variables.forEach(function(variable){
			allVariables[variable.id] = new createVariable(variable, config);
		});
	});
}
/*
function loadTimers(){
	var query = "SELECT id, name, active, variables, conditions, actions, user, lastexec FROM timer;";
	db.all(query, function(err, timers){
		if(err){
			log.debug(err);
			return;
		}else{
			timers.forEach(function(timer){
				allTimers[timer.id] 			= new createTimer(timer, config);
				if(allTimers[timer.id].timer.variables){
					var variables = Object.keys(allTimers[timer.id].timer.variables);
					variables.forEach(function(variable){
						allVariables[variable].dependendTimer.push(timer.id);
					});
				}else{
					allTimers[timer.id].setActive(true);
				}
			});
		}
	});
}
*/

process.on('SIGINT', function(code){
	log.info("SIGINT");
	stopServer();
	stopDependend([
		"timerserver.js",
		"countdownserver.js",
		// "SwitchServer/adapter.js",
	]);
	process.exit(1);
});