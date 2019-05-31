#!/usr/bin/env node

var express					=	require('express.oi');

var fs						=	require('fs');
var fork					=	require('child_process').fork;
var bodyParser				=	require('body-parser');
var cookieParser			=	require('cookie-parser');
var crypto					=	require('crypto');
var later 					=	require('later');
var request					=	require('request');
var events					=	require('events');


var config					=	require("./config.json");
var db						=	require('./app/functions/database.js');
// Temperatursensoren
var switchServerFunctions	=	require('./app/functions/SwitchServer.js');
// Countdowns nach ausführung löschen | countdownserver.js 
var countdownFunctions		=	require('./app/functions/countdown.js');
// Schaltaktionen ausführen
var deviceFunctions			=	require('./app/functions/device.js');
var groupFunctions			=	require('./app/functions/group.js');
var roomFunctions			=	require('./app/functions/room.js');

var blu						=	require('./app/functions/newVariable.js');
var allVariables 			=   new blu();


var bla 					=	require("./app/functions/alerts.js");
var allAlerts 				= 	new bla();

var server;
var sockets					=	[];
var logFiles				=	{};
var plugins 				=	{};

var logging                 =   require('./app/functions/logger.js');
log                         =   new logging(config);

log.on('error', function(data){
    allAlerts.addAll({
        title: "Servererror!",
        message: data,
        type: "danger",
        toAdmin: true
    });
});
log.on('all', function(data){
    app.io.emit("serverError", data);
})

allAlerts.on("add", (data) => {
	console.log("show Alert mit id: " + data.id);
	app.io.in(data.user).emit('change', new message("alerts:add", data));
	for(var index in config.switchserver){
		request.post({
			url:'http://' + config.switchserver[index].ip + ':' + config.switchserver[index].port + '/alert',
			form: data
		},function( err, httpResponse, body){
			if(err){
				log.error("Der SwitchServer (" + err.address + ":" + err.port + ") ist nicht erreichbar! Schaue in die Einstellungen -> SwitchServer oder frage deinen Admin um Rat.");
				return;
			}
	        log.info("Erfolgreich an den SwitchServer gesendet");
		});
	}
});

allAlerts.on("remove", (alert) => {
	console.log("remove Alert mit id: " + alert.id);
	app.io.in(alert.user).emit('change', new message('alerts:remove', alert.id));
	for(var index in config.switchserver){
		request.delete({
			url:'http://' + config.switchserver[index].ip + ':' + config.switchserver[index].port + '/alert',
			form: alert
		},function( err, httpResponse, body){
			if(err){
				log.error("Der SwitchServer (" + err.address + ":" + err.port + ") ist nicht erreichbar! Schaue in die Einstellungen -> SwitchServer oder frage deinen Admin um Rat.");
				return;
			}
	        log.info("Erfolgreich an den SwitchServer gesendet");
		});
	}
});

allVariables.on("change", (variable) => {
	app.io.emit('change', new message('variables:edit',variable));
	
	for(var index in config.switchserver){
		request.post({
			url:'http://' + config.switchserver[index].ip + ':' + config.switchserver[index].port + '/variable',
			form: variable
		},function( err, httpResponse, body){
			if(err){
				log.error("Der SwitchServer (" + err.address + ":" + err.port + ") ist nicht erreichbar! Schaue in die Einstellungen -> SwitchServer oder frage deinen Admin um Rat.");
				return;
			}
	        log.info("Erfolgreich an den SwitchServer gesendet");
		});
	}
});

if(config.useHTTPS){
	var options = {
		key: fs.readFileSync('./key.pem'),
		cert: fs.readFileSync('./cert.pem')
	}
	var app						=	express().https(options).io();
}else{
	var app						=	express().http().io();
}

app.use(bodyParser.json()); 						// for parsing application/json
app.use(bodyParser.urlencoded({ extended: true }));	// for parsing application/x-www-form-urlencoded
app.use(cookieParser());							// for parsing cookies
app.use(express.static(__dirname + '/public/settings'));		// provides static htmls

app.get('/settings', function(req, res){
	res.redirect('/');
});

app.io.on('connect', function(socket){
	log.info("Neuer Client verbunden: " + socket.id);
	socket.on('disconnect', function(reason){
		log.info("Client getrennt: " + socket.id);
	})
});

startServer();
startDependend([
	// "SwitchServer/adapter.js",
	"countdownserver.js",
	"timerserver.js"
]);

require('./app/routes.js')			(app, db, plugins, log, allAlerts, allVariables);
require('./app/ioroutes/device.js')	(app, db, plugins, log, allAlerts);


function stopDependend(data){
	for (var i = 0;	i > data.length; i++) {
		plugins[data[i]].kill('SIGHUP');
	}
}

function startDependend(data){
	data.forEach(function(file){
		var splitedfile 			= file.split(".");
		if(splitedfile[0].includes("/")){
			var name 				= splitedfile[0].split("/");
			var filename 			= name[name.length - 1].toLowerCase();
		}else{
			var filename 			= splitedfile[0];
		}
		var debugFile 				= __dirname + '/log/debug-' + filename + '.log';
		logFiles[filename]			=	fs.createWriteStream( debugFile, {flags : 'w'});
		plugins[filename] 			= fork( __dirname + '/' + file);

		plugins[filename].on('message', function(response) {
			if(response.log){
				var now = new Date;
				var datum =  now.getDate() + "." + (now.getMonth() + 1) + "." + now.getFullYear() + " " + now.getHours() + ":" + now.getMinutes() + ":" + now.getSeconds();

				if(typeof response.log === "object"){
					response.log = JSON.stringify(response.log);
				}else{
					response.log = response.log.toString();
				}
				logFiles[filename].write(datum +": "+response.log + "\n");
			}
			if(response.setVariable){
				// Workaround, notwendig? Kein Ahnung 04.09.17
				if(response.setVariable.action){
					allVariables.setVariable(response.setVariable.action.id, response.setVariable.action.status, function(status){});
					plugins['timerserver'].send({"setVariable":response.setVariable.action});
				}else{
					allVariables.setVariable(response.setVariable.id, response.setVariable.status, function(status){});
					plugins['timerserver'].send({"setVariable":response.setVariable});
				}
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
                                log.error(err);
							}
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
				allVariables.replaceVar(data.message, function(content){
					allVariables.replaceVar(data.title, function(title){
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
            if(response.deleteCountdown){
                countdownFunctions.deleteCountdown(response.deleteCountdown.id, function(){
                    app.io.in(response.deleteCountdown.user).emit('change', new message('countdowns:remove', response.deleteCountdown.id));
                });
            }
            // Chat message hinzufügen? notwendig? Notwendig wenn timer selbige beherschen sollen (denke ich)
		});
	});
}

function startServer(port, callback){
	var port = port || config.QuickSwitch.port || 3333;
	try{
		server = app.listen(port, function(){
			log.debug("Der Server wurde erfolgreich auf Port " + port + " gestartet!", port);
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
		server.close();
		for(var i=0; i < sockets.length; i++){
			sockets[i].destroy();
		}
		log.debug("Der Server wurde gestoppt!");
		if(callback){
			callback(200);
		}
	}catch(e){
		log.error("Fehler: Der Server konnte nicht gestoppt werden!");
		log.error(e);
		if (callback){
			callback(404);
		}
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

app.io.route('settings', {
	get: function(req){
		req.socket.emit('change', new message('settings:get', config));
	},
	save: (req) => {
		fs.writeFile(__dirname + "/config.json", JSON.stringify(req.data), 'utf8', (err) => {
			if(err){
				log.error("Die Einstellungen konnten nicht gespeichert werden!");
				log.error(err);
			}else{
				app.io.emit('change', new message('settings:get', req.data));
				if(req.data.mysql != config.mysql || req.data.QuickSwitch != config.QuickSwitch){
					log.error("Die Einstellungen wurden geändert! Die Haussteuerung ist nun unter folgender Addresse zu erreichen: <a href='http://"+req.data.QuickSwitch.ip +":"+req.data.QuickSwitch.port+"'>QuickSwitch</a>");
					stopServer(function(){
						startServer(req.data.QuickSwitch.port);
					});
				}
				config = req.data;
			}
		});
	},
	errors: function(req){
		req.socket.emit('serverErrors', log.errors);
	}
});

app.io.route('switchServer', {
	get: function(req){
		req.socket.emit('switchServer', config.switchserver);
	}
});

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
