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


var blu						=	require('./timerserver.js');
var allTimers 				=   new blu(log, allVariables);

log.on('error', function(data){
    allAlerts.addAll({
        title: "Servererror!",
        message: data.message,
        type: "danger",
        toAdmin: true
    });
});
log.on('all', function(data){
    app.io.emit("serverError", data);
})

allAlerts.on("add", (data) => {
	log.info("allAlerts.on.add." + data.id);
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
	        log.info("Erfolgreich an den SwitchServer (" + config.switchserver[index].ip + ":" + config.switchserver[index].port + ") gesendet");
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
	        log.info("Erfolgreich an den SwitchServer (" + config.switchserver[index].ip + ":" + config.switchserver[index].port + ") gesendet");
		});
	}
});

allVariables.on("change", (variable) => {
	app.io.emit('change', new message('variables:edit',variable));
	allTimers.setVariable(variable);
	for(var index in config.switchserver){
		request.post({
			url:'http://' + config.switchserver[index].ip + ':' + config.switchserver[index].port + '/variable',
			form: variable
		},function( err, httpResponse, body){
			if(err){
				log.error("Der SwitchServer (" + err.address + ":" + err.port + ") ist nicht erreichbar! Schaue in die Einstellungen -> SwitchServer oder frage deinen Admin um Rat.");
				return;
			}
	        log.info("Erfolgreich an den SwitchServer (" + config.switchserver[index].ip + ":" + config.switchserver[index].port + ") gesendet");
		});
	}
});

allTimers.on("switchAction", (data) => {
	if(data.room){
		roomFunctions.switchRoom(data.room.action, data.room.switchstatus, app, function(err){
			if(err != 200){
				log.debug(err + "Raum konnte nicht geschaltet werden");
			}
		});
	}
	if(data.group){
		groupFunctions.switchGroup(app, data.group.action, data.group.switchstatus, function(err){
			if(err != 200){
				log.debug( err + ":Die Gruppe mit der ID " + req.data.switch.group.id + " konnte nicht geschaltet werden!");
			}
		});
	}
	if(data.device){
		deviceFunctions.switchDevice(app, data.device.action.deviceid, data.device.switchstatus, function(err){
			if(err != 200){
				log.debug( "Gerät mit der ID " + data.device.action.deviceid + " konnte nicht geschaltet werden!");
			}
		});
	}
	if(data.url){
		var action = data.url;
		if(parseInt(action.timeout)){
			setTimeout(function(){
				request(action.action.url, function (err, data, body) {
					if (err) {
						log.error(err);
					}
				});
			}, action.timeout * 1000);
		}else{
			request(action.action.url, function (err, data, body) {
				if (err) {
					log.error(err);
				}
			});
		}
	}
	if(data.alert){
		var data = data.alert.action;
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
	if(data.saveSensors){
		log.debug("Sensoren speichern");
		var onewire = {
			"protocol": "onewire",
			"switchserver":0
		}
		switchServerFunctions.sendto(app, "save", onewire);
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
	"countdownserver.js"
]);

require('./app/routes.js')			(app, log, allAlerts, allVariables);
require('./app/ioroutes/device.js')	(app, log, allAlerts, allTimers, allVariables);

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
