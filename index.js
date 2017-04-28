#!/usr/bin/env node

var express					=	require('express.oi');

var fs						=	require('fs');
var fork					=	require('child_process').fork;
var bodyParser				=	require('body-parser');
var cookieParser			=	require('cookie-parser');
var crypto					=	require('crypto');


var server;
var sockets					=	[];
var log_file				=	{};
var plugins 				=	{};
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
var variableFunctions		=	require('./app/functions/variable.js');
var adapterFunctions		=	require('./app/functions/adapter.js');

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

if(!fs.existsSync("./log")){
	fs.mkdirSync("./log", 0766, function(err){
		if(err){
			console.log("mkdir ./log: failed: " + err);
		}
	});
}

var error = function(data){
	app.io.emit("serverError", data);
}

// Setup the ready route, join room and broadcast to room.
app.io.route('room', {
	join: function(req) {
		var user = req.data;
		console.log("join:" + user.name);
		req.socket.join(user.name);

		countdownFunctions.getCountdowns(user.name, function(data){
			req.socket.emit('change', new message('countdowns:get', data));
		});

		deviceFunctions.favoritDevices(user.favoritDevices, function(data){
			req.socket.emit('change', new message('favoritDevices:get', data));
		});
		
		groupFunctions.getGroups(user.name, function(data){
			req.socket.emit('change', new message('groups:get', data));
		});
		
		timerFunctions.getUserTimers(user.name, function(data){
			req.socket.emit('change', new message('timers:get', data));
		});

		variableFunctions.favoritVariables(user.favoritVariables, "object", function(data){
			req.socket.emit('change', new message('favoritVariables:get', data));
		});
	},
	leave: function(req) {
		console.log("leave:" + req.data.name);
		req.socket.leave(req.data.name);
	},
	get: function(req){
		roomFunctions.getRoom(req.data, function(data){
			req.socket.emit('change', new message('room:get', data));
		});
	},
	save: function(req){
		roomFunctions.saveRoom(req.data.save, function(room){
			roomFunctions.getRooms( "object", function(data){
				app.io.emit('change', new message('rooms:get', data));
			});
		});
	},
	remove: function(req){
		roomFunctions.deleteRoom(req.data.remove, function(status){
			switch(status){
				case 200:
					roomFunctions.getRooms('object', function(data){
						req.socket.emit('change', new message('rooms:get', data));			
					});
					deviceFunctions.getDevices('object', function(data){
						app.io.emit('change', new message('devices:get', data));
					});
					break;
				case 409:
					error(req, "Der Raum enthält Geräte und kann nicht gelöscht werden!");
					break;
				default:
					error(req, status);
					break;
			}

		});
	}
});

app.io.route('settings', {
	get: function(req){
		req.socket.emit('change', new message('settings:get', config));
	},
	save: function(req){
		fs.writeFile(__dirname + "/config.json", JSON.stringify(req.data), 'utf8', function(err){
			if(err){
				error("Die Einstellungen konnten nicht gespeichert werden!");
				error(err);
			}else{
				// db	=	require('./app/functions/database.js');
				app.io.emit('change', new message('settings:get', req.data));
				if(req.data.QuickSwitch.port != config.QuickSwitch.port){
					error("Die Einstellungen wurden geändert! Die aussteuerung ist nun unter folgender addresse zu erreichen: <a href='http://"+req.data.QuickSwitch.ip +":"+req.data.QuickSwitch.port+"'>QuickSwitch</a>");
					stopServer(function(){
						startServer(req.data.QuickSwitch.port);
					});
				}else{
					config = req.data;
				}
			}
		});
	}
});

app.io.route('switchServer', {
	get: function(req){
		req.socket.emit('switchServer', config.switchserver);
	}
});

app.io.route('variable', {
	get: function(req){
		variableFunctions.getVariable(req.data, function(data){
			req.socket.emit('change', new message('variable:get', data));
		});
	},
	remove: function(req){
		variableFunctions.deleteVariable(req.data.remove.uid, function(data){
			app.io.emit('change', new message('variables:remove', req.data.remove.id));
		});
	},
	save: function(req){
		variableFunctions.saveVariable(req.data, function(data){
			app.io.emit('change', new message('variables:edit', req.data));
		});
	}
});
app.io.route('variables', {
	add: function(req){
		variableFunctions.saveNewVariable(req.data.add, function(err, data){
			app.io.emit('change', new message('variables:add', data));
		});
	},
	remove: function(req){
		variableFunctions.deleteVariable(req.data.remove, function(data){
			app.io.emit('change', new message('variables:remove', req.data.remove));
		});
	},
	edit: function(req){
		variableFunctions.saveEditVariable(req.data, function(err, data){
			app.io.emit('change', new message('variables:edit', data));
		});
	},
	get: function(req){
		variableFunctions.getVariables(function(data){
			req.socket.emit('change', new message('variables:get', data));
		});
	},
	favoriten: function(req){
		userFunctions.getUser(req.data, function(user){
			variableFunctions.favoritVariables(user.favoritVariables, "array", function(data){
				req.socket.emit('change', new message('favoritVariables:get', data));
			});
		});
	},
	chart: function(req){
		// userFunctions.getUser(req.data, function(user){
			console.log(req.data);
			variableFunctions.getStoredVariables(req.data, req.data.hours, function(data){
				req.socket.emit('change', new message('varChart:get', data));
			});
		// });
	},
	storedVariable: function(req){
		variableFunctions.getStoredVariable(req.data.id, req.data.hours, function(data){
			req.socket.emit('change', new message('storedVariable:get', data));
		});
	}
});

app.io.route('rooms', {
	remove: function(req){
		roomFunctions.deleteRoom(req.data.remove, function(err){
			app.io.emit('change', new message('rooms:remove', req.data.remove));
		});
	},
	get: function(req){
		roomFunctions.getRooms('object', function(data){
			req.socket.emit('change', new message('rooms:get', data));			
		});
	},
	switch: function(req){
		roomFunctions.switchRoom(req.data.switch.room, req.data.switch.status, app, function(err){
			if(err != 200){
				error(err + "Raum konnte nicht geschaltet werden");
			}
		});
	}
});

app.io.route('alerts', {
	add: function(req){
		app.io.in(req.data.user.name).emit('change', new message('alerts:add', req.data));
	},
	remove: function(req){
		app.io.in(req.data.user.name).emit('change', new message('alerts:remove', req.data.remove));
	},
	addAll: function(req){
		app.io.emit('change', new message('alerts:add', req.data));
	}
});

app.io.route('messages', {
	add: function(req){
		var data = req.data.add;
		data.author = req.data.user.name;
		data.time = new Date().getTime();
		messageFunctions.saveMessage(data, function(err, savedMessage){
			app.io.emit('change', new message('chatMessages:add', savedMessage));
		});
	},
	loadOld: function(req){
		messageFunctions.loadOldMessages(req.data, function(data){

			data.messages.forEach(function(mess){
				req.socket.emit('change', new message('chatMessages:add', mess));
			});
			req.socket.emit('change', new message('moreMessagesAvailable:get', data.moreMessagesAvailable));
		});
	},
});

app.io.route('user', {
	get: function(req){
		userFunctions.getUser(req.data, function(data){
			req.socket.emit('change', new message('user:get', data));
		});
	},
	remove: function(req){
		userFunctions.deleteUser(req.data.remove, function(status){
			if(status == "200"){
				userFunctions.getUsers(function(data){
					req.socket.broadcast.emit('change', new message('users:get', data));
				});
			}
		});
	},
	save: function(req){
		userFunctions.saveUser(req.data.save, function(status){
			userFunctions.getUsers(function(data){
				req.socket.broadcast.emit('change', new message('users:get', data));
			});
		});
	}
});

app.io.route('users', {
	get: function(req){
		userFunctions.getUsers(function(data){
			req.socket.emit('change', new message('users:get', data));
		});
	}
});

app.io.route('countdowns', {
	add: function(req){
		var data = req.data.add;
		data.settime = new Date().getTime();		
		data.time = data.settime + (data.time * 60000);
		countdownFunctions.setNewCountdown(data, function(err, savedCountdown){
			if(err != "200"){
				error("Countdown konnte nicht gespeichert werden!");
				console.log("Countdown konnte nicht gespeichert werden!");
				console.log( err );
			}else{
				app.io.in(req.data.user.name).emit('change', new message('countdowns:add', savedCountdown));
			}
		});
	},
	remove: function(req){
		var id = req.data.remove;
		countdownFunctions.deleteCountdown(id, function(data){
			app.io.in(req.data.user.name).emit('change', new message('countdowns:remove', id));
		});
	},
	get: function(req){
		countdownFunctions.getCountdowns(user.name, function(data){
			req.socket.emit('change', new message('countdowns:get', data));
		});
	}
});

app.io.route('devices', {
	get: function(req){
		deviceFunctions.getDevices('object', function(data){
			req.socket.emit('change', new message('devices:get', data));
		});
	},
	favoriten: function(req){
		userFunctions.getUser(req.data, function(user){
			deviceFunctions.favoritDevices(user.favoritDevices, function(data){
				req.socket.emit('change', new message('favoritDevices:get', data));
			});
		});
	},
	active:function(req){
		switchServerFunctions.sendActiveDevices(app, function(){});
	},
	switch:function(req){
		var id = req.data.switch.id;
		var status = req.data.switch.status;
		deviceFunctions.switchDevice(app, id, status, function(err){
			if(err != 200){
				error( "Gerät mit der ID " + id + " konnte nicht geschaltet werden!");
			}
		});
	},
	switchAll: function(req){
		deviceFunctions.switchDevices(app, req.data.switchAll, req, function(err){
			if(err != 200){
				error("Die Geräte konnten nicht geschaltet werden: " + req.data.switchAll);
			}
		});
	},
	devicelist: function(req){
		deviceFunctions.getDevices('array', function(data){
			req.socket.emit('change', new message('devicelist:get', data));
		});
	}
});

app.io.route('device', {
	save: function(req){
		deviceFunctions.saveDevice(req.data.save, function(err, device){
			deviceFunctions.getDevices('object', function(data){
				req.socket.emit('change', new message('devices:get', data));
			});
		});
	},
	remove:function(req){
		deviceFunctions.deleteDevice(req.data.remove, function(data){
			deviceFunctions.getDevices('object', function(data){
				app.io.emit('change', new message('devices:get', data));
			});
		});
	},
	get: function(req){
		deviceFunctions.getDevice(req.data, function(data){
			req.socket.emit('change', new message('device:get', data));
		});
	}
});

app.io.route('switchHistory', {
	get: function(req){
		deviceFunctions.getSwitchHistoryByID(req.data, function(data){
			req.socket.emit('change', new message('switchHistory:push', data));
		});
	}
});

app.io.route('timers', {
	save: function(req){
		timerFunctions.saveTimer(req.data.save, function(err, data){
			app.io.in(req.data.user.name).emit('change', new message('timers:add', data));
		});
	},
	remove: function(req){
		plugins.timerserver.send({deaktivateInterval:req.data.remove});
		setTimeout(function(){
			timerFunctions.deleteTimer(req.data.remove, function(err, data){
				app.io.emit("change", new message('timers:remove', req.data.remove));
			});
		}, 1000);
	},
	get: function(req){
		timerFunctions.getTimer(req.data.get, function(timer){
			req.socket.emit('change', new message('timers:get', data));
		});
	},
	switch: function(req){
		var data = req.data.switch;
		timerFunctions.switchTimer(data, function(status){
			if(status == 200){
				timerFunctions.getTimer(data.id, function(timer){
					app.io.in(req.data.user.name).emit('change', new message('timers:add', timer));
				});
			}else{
				error("Der Timer mit der ID " + data.id + " konnte nicht geschaltet werden");
			}
		});
		if(req.data.switch.active == false || req.data.switch.active == 'false'){
			plugins.timerserver.send({deaktivateInterval:req.data.switch.id});
		}
	},
	switchAll: function(req){
		timerFunctions.switchActions(req.data.switchAll, true, true);
	}
});

app.io.route('group', {
	get:function(req){
		groupFunctions.getGroup(req.data, function(data){
			req.socket.emit('change', new message('group:get', data));
		});
	},
	remove: function(req){
		groupFunctions.deleteGroup(req.data.remove, function(data){
			if(data != 200){
				error( "Die Gruppe mit der ID " + req.data.remove + " konnte nicht gelöscht werden!");
			}else{
				app.io.in(req.data.user).emit('change', new message('groups:remove', req.data.remove));
			}
		});
	},
	save: function(req){
		groupFunctions.saveGroup(req.data.save, function(groups){
			app.io.in(req.data.user).emit('change', new message('groups:get', groups));
		});
	}
});

app.io.route('groups', {
	get: function(req){
		groupFunctions.getGroups(user.name, function(data){
			req.socket.emit('change', new message('groups:get', data));
		});
	},
	getAll:function(req){
		groupFunctions.getAllGroups(function(data){
			req.socket.emit('change', new message('groups:get', data));
		});
	},
	switch: function(req){
		groupFunctions.switchGroup(app, req.data.switch.group, req.data.switch.status, function(err){
			if(err != 200){
				error( err + ":Die Gruppe mit der ID " + req.data.switch.group.id + " konnte nicht geschaltet werden!");
			}
		});
	}
});

app.get('/pc', function(req, res) {
	res.sendfile(__dirname + '/public/pc/index.html');
})

app.get('/settings', function(req, res) {
	res.sendfile(__dirname + '/public/settings/index.html');
})

app.get('/mobile', function(req, res) {
	res.sendfile(__dirname + '/public/mobile/index.html');
})

app.get('/mobil', function(req, res) {
	res.redirect('/mobile');
})

app.get('/tablet', function(req, res) {
	res.sendfile(__dirname + '/public/tablet/index.html');
})

app.get('/', function(req, res) {
	res.sendfile(__dirname + '/public/index.html');
})


require('./app/routes')(app, db);


function stopDependend(data){
	for (var i = 0;	i > data.length; i++) {
		plugins[data[i]].kill('SIGHUP');
	}
}

function startDependend(data){
	// Andere Dateien starten
	data.forEach(function(file){
		var splitedfile 			= file.split(".");
		if(splitedfile[0].includes("/")){
			var name 				= splitedfile[0].split("/");
			var filename 			= name[name.length - 1].toLowerCase();
		}else{
			var filename 			= splitedfile[0];
		}
		var debugFile 				= __dirname + '/log/debug-' + filename + '.log';
		log_file[filename]			=	fs.createWriteStream( debugFile, {flags : 'w'});

		plugins[filename] 		= fork( './' + file);

		plugins[filename].on('message', function(response) {
			if(response.log){
				var now = new Date;
				var datum =  now.getDate() + "." + (now.getMonth() + 1) + "." + now.getFullYear() + " " + now.getHours() + ":" + now.getMinutes() + ":" + now.getSeconds();
				
				log_file[filename].write(datum +":"+response.log.toString() + "\n");
				console.log(datum +":"+ response.log.toString());
			}
			if(response.setVariable){
				timerFunctions.checkTimer(response.setVariable);
				variableFunctions.setVariable(response.setVariable, app, function(){});
			}
			if(response.setDeviceStatus){
				var id = parseInt(response.setDeviceStatus.id);
				deviceFunctions.setDeviceStatus(id, response.setDeviceStatus.status);
				deviceFunctions.getDevice(id, function(device){
					app.io.emit('change', new message("devices:switch", {"device":device,"status":response.setDeviceStatus.status}));
				});
			}
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

function startServer(port, callback){
	var port = port || config.QuickSwitch.port || 1230;
	try{
		server = app.listen(port, function(){
			console.log("Erfolgreich gestartet!", port);
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
		console.log(e);
	}
}

function stopServer(callback){
	try{
		error("Der Server wurde gestoppt!");
		server.close();
		setTimeout(function(){	
			// delete server;
			for(var i=0; i < sockets.length; i++){
				sockets[i].destroy();
			}
			console.log("Der Server wurde gestoppt!");
			if(callback){
				callback(200);
			}
		}, 1000);
	}catch(e){
		console.log("Fehler: Der Server konnte nicht gestoppt werden!");
		console.log(e);
		if (callback){
			callback(404);
		}
	}
}

startServer();
startDependend([
	"SwitchServer/adapter.js",
	"countdownserver.js",
	"timerserver.js"
]);

process.on('SIGINT', function(code){
	stopServer();
	stopDependend([
		"timerserver.js",
		"countdownserver.js",
		"SwitchServer/adapter.js",
	]);
	process.exit(1);
});