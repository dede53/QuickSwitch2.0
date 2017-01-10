var express					=	require('express.io');
var app						=	express().http().io();

var fs 						=	require('fs');
var fork					=	require('child_process').fork;
var bodyParser				=	require('body-parser');
var cookieParser			=	require('cookie-parser');

var config 					=	require("./config.json");
var switchServerFunctions 	=	require('./app/functions/SwitchServer.js');
var db 						=	require('./app/functions/database.js');
var countdownFunctions 		=	require('./app/functions/countdown.js');
var deviceFunctions 		=	require('./app/functions/device.js');
var groupFunctions 			=	require('./app/functions/group.js');
var messageFunctions 		=	require('./app/functions/message.js');
var roomFunctions 			=	require('./app/functions/room.js');
var timerFunctions 			=	require('./app/functions/timer.js');
var userFunctions 			=	require('./app/functions/user.js');
var variableFunctions 		=	require('./app/functions/variable.js');
var adapterFunctions 		=	require('./app/functions/adapter.js');


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
	app.io.broadcast("serverError", data);
}

// Setup the ready route, join room and broadcast to room.
app.io.route('room', {
	join: function(req) {
		var user = req.data;
		console.log("join:" + user.name);
		req.io.join(user.name);

		countdownFunctions.getCountdowns(user.name, function(data){
			req.io.emit('change', new message('countdowns:get', data));
		});

		deviceFunctions.favoritDevices(user.favoritDevices, function(data){
			req.io.emit('change', new message('favoritDevices:get', data));
		});
		
		groupFunctions.getGroups(user.name, function(data){
			req.io.emit('change', new message('groups:get', data));
		});
		
		timerFunctions.getUserTimers(user.name, function(data){
			req.io.emit('change', new message('timers:get', data));
		});
		
		variableFunctions.favoritVariables(user.favoritVariables, "object", function(data){
			req.io.emit('change', new message('favoritVariables:get', data));
		});
	},
	leave: function(req) {
		console.log("leave:" + req.data.name);
		req.io.leave(req.data.name);
	},
	get: function(req){
		roomFunctions.getRoom(req.data, function(data){
			req.io.emit('change', new message('room:get', data));
		});
	},
	save: function(req){
		roomFunctions.saveRoom(req.data.save, function(room){
			roomFunctions.getRooms( "object", function(data){
				app.io.broadcast('change', new message('rooms:get', data));
			});
		});
	},
	remove: function(req){
		roomFunctions.deleteRoom(req.data.remove, function(status){
			switch(status){
				case 200:
					roomFunctions.getRooms('object', function(data){
						req.io.emit('change', new message('rooms:get', data));			
					});
					deviceFunctions.getDevices('object', function(data){
						app.io.broadcast('change', new message('devices:get', data));
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

app.io.route('switchServer', {
	get: function(req){
		req.io.emit('switchServer', config.switchserver);
	}
});

app.io.route('variable', {
	get: function(req){
		variableFunctions.getVariable(req.data, function(data){
			req.io.emit('change', new message('variable:get', data));
		});
	},
	remove: function(req){
		variableFunctions.deleteVariable(req.data.remove, function(data){
			app.io.broadcast('change', new message('variables:remove', req.data.remove));
		});
	}
});
app.io.route('variables', {
	add: function(req){
		variableFunctions.saveNewVariable(req.data.add, function(err, data){
			app.io.broadcast('change', new message('variables:add', data));
		});
	},
	remove: function(req){
		variableFunctions.deleteVariable(req.data.remove, function(data){
			app.io.broadcast('change', new message('variables:remove', req.data.remove));
		});
	},
	edit: function(req){
		variableFunctions.saveEditVariable(req.data, function(err, data){
			app.io.broadcast('change', new message('variables:edit', data));
		});
	},
	get: function(req){
		variableFunctions.getVariables(function(data){
			req.io.emit('change', new message('variables:get', data));
		});
	},
	favoriten: function(req){
		userFunctions.getUser(req.data, function(user){
			variableFunctions.favoritVariables(user.favoritVariables, "array", function(data){
				req.io.emit('change', new message('favoritVariables:get', data));
			});
		});
	},
	chart: function(req){
		variableFunctions.getStoredVariables(req.data.user, req.data.hours, function(data){
			req.io.emit('change', new message('varChart:get', data));
		});
	},
	storedVariable: function(req){
		variableFunctions.getStoredVariable(req.data.id, req.data.hours, function(data){
			req.io.emit('change', new message('storedVariable:get', data));
		});
	}
});

app.io.route('rooms', {
	add: function(req){
		roomFunctions.saveNewRoom(req.data.add, function(err, data){
			if(err == 201){
				app.io.broadcast('change', new message('rooms:add', data));
			}
		});
	},
	remove: function(req){
		roomFunctions.deleteRoom(req.data.remove, function(err){
			app.io.broadcast('change', new message('rooms:remove', req.data.remove));
		});
	},
	edit: function(req){
		roomFunctions.saveEditRoom(req.data.edit, function(err, data){
			app.io.broadcast('change', new message('rooms:add', data));
		});
	},
	get: function(req){
		roomFunctions.getRooms('object', function(data){
			req.io.emit('change', new message('rooms:get', data));			
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
		app.io.room(req.data.user.name).broadcast('change', new message('alerts:add', req.data));
	},
	remove: function(req){
		app.io.room(req.data.user.name).broadcast('change', new message('alerts:remove', req.data.remove));
	},
	addAll: function(req){
		app.io.broadcast('change', new message('alerts:add', req.data));
	}
});

app.io.route('messages', {
	add: function(req){
		var data = req.data.add;
		data.author = req.data.user.name;
		data.time = new Date().getTime();
		messageFunctions.saveMessage(data, function(err, savedMessage){
			app.io.broadcast('change', new message('chatMessages:add', savedMessage));
		});
	},
	loadOld: function(req){
		messageFunctions.loadOldMessages(req.data, function(data){

			data.messages.forEach(function(mess){
				req.io.emit('change', new message('chatMessages:add', mess));
			});
			req.io.emit('change', new message('moreMessagesAvailable:get', data.moreMessagesAvailable));
		});
	},
});

app.io.route('user', {
	get: function(req){
		userFunctions.getUser(req.data, function(data){
			req.io.emit('change', new message('user:get', data));
		});
	},
	edit: function(req){
		userFunctions.saveEditUser(req.data, function(status){
			userFunctions.getUsers(function(data){
				req.io.broadcast('change', new message('users:get', data));
			});
		});
	},
	add: function(req){
		userFunctions.saveNewUser(req.data, function(status){
			userFunctions.getUsers(function(data){
				req.io.broadcast('change', new message('users:get', data));
			});
		});
	},
	remove: function(req){
		userFunctions.deleteUser(req.data.remove, function(status){
			if(status == "200"){
				userFunctions.getUsers(function(data){
					req.io.broadcast('change', new message('users:get', data));
				});
			}
		});
	},
	save: function(req){
		userFunctions.saveUser(req.data.save, function(status){
			userFunctions.getUsers(function(data){
				req.io.broadcast('change', new message('users:get', data));
			});
		});
	}
});

app.io.route('users', {
	get: function(req){
		userFunctions.getUsers(function(data){
			req.io.emit('change', new message('users:get', data));
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
				app.io.room(req.data.user.name).broadcast('change', new message('countdowns:add', savedCountdown));
			}
		});
	},
	remove: function(req){
		var id = req.data.remove;
		countdownFunctions.deleteCountdown(id, function(data){
			app.io.room(req.data.user.name).broadcast('change', new message('countdowns:remove', req.data.id));
		});
	},
	get: function(req){
		countdownFunctions.getCountdowns(user.name, function(data){
			req.io.emit('change', new message('countdowns:get', data));
		});
	}
});

app.io.route('devices', {
	get: function(req){
		deviceFunctions.getDevices('object', function(data){
			req.io.emit('change', new message('devices:get', data));
		});
	},
	favoriten: function(req){
		userFunctions.getUser(req.data, function(user){
			deviceFunctions.favoritDevices(user.favoritDevices, function(data){
				req.io.emit('change', new message('favoritDevices:get', data));
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
			req.io.emit('change', new message('devicelist:get', data));
		});
	}
});

app.io.route('device', {
	save: function(req){
		deviceFunctions.saveDevice(req.data.save, function(err, device){
			deviceFunctions.getDevices('object', function(data){
				req.io.emit('change', new message('devices:get', data));
			});
		});
	},
	add: function(req){
		var data = {
			"name": req.data.add.name,
			"buttonLabelOn": req.data.add.buttonLabelOn,
			"buttonLabelOff": req.data.add.buttonLabelOff,
			"CodeOn": req.data.add.CodeOn,
			"CodeOff": req.data.add.CodeOff,
			"protocol": req.data.add.protocol,
			"room": req.data.add.roomid,
			"switchserver": req.data.add.switchserver
		};
		deviceFunctions.saveNewDevice(data, req, res, function(data){
			deviceFunctions.getDevices('object', req, res, function(data){
				app.io.broadcast('change', new message('devices:get', data));
			});
		});
	},
	edit: function(req){
		var data = 
			{
				"deviceid": req.data.edit.deviceid,
				"name": req.data.edit.name,
				"buttonLabelOn": req.data.edit.buttonLabelOn,
				"buttonLabelOff": req.data.edit.buttonLabelOff,
				"CodeOn": req.data.edit.CodeOn,
				"CodeOff": req.data.edit.CodeOff,
				"protocol": req.data.edit.protocol,
				"room": req.data.edit.roomid,
				"switchserver": req.data.edit.switchserver
			};
		deviceFunctions.saveEditDevice(data, function(data){
			deviceFunctions.getDevices('object', function(data){
				app.io.broadcast('change', new message('devices:get', data));
			});
		});
	},
	remove:function(req){
		var id = req.data.remove;
		deviceFunctions.deleteDevice(id, function(data){
			deviceFunctions.getDevices('object', function(data){
				app.io.broadcast('change', new message('devices:get', data));
			});
		});
	},
	get: function(req){
		deviceFunctions.getDevice(req.data, function(data){
			req.io.emit('change', new message('device:get', data));
		});
	}
});

app.io.route('switchHistory', {
	get: function(req){
		deviceFunctions.getSwitchHistoryByID(req.data, function(data){
			req.io.emit('change', new message('switchHistory:push', data));
		});
	}
});

app.io.route('timers', {
	add: function(req){
		timerFunctions.saveNewTimer(req.data.add, function(err, data){
			app.io.room(data.user).broadcast("change", new message("timers:add", data));
		});
	},
	edit: function(req){
		timerFunctions.saveEditTimer(req.data.edit, function(err, data){
			app.io.broadcast("change", new message('timers:edit', data));
		});
	},
	save: function(req){
		timerFunctions.saveTimer(req.data.save, function(err, data){
			app.io.room(req.data.user.name).broadcast('change', new message('timers:add', data));
		});
	},
	remove: function(req){
		timerFunctions.deleteTimer(req.data.remove, function(err, data){
			app.io.broadcast("change", new message('timers:remove', req.data.remove));
		});
	},
	get: function(req){
		timerFunctions.getTimer(req.data.get, function(timer){
			req.io.emit('change', new message('timer:get', data));
		});
	},
	switch: function(req){
		var data = req.data.switch;
		timerFunctions.switchTimer(data, function(status){
			if(status == 200){
				timerFunctions.getTimer(data.id, function(timer){
					app.io.room(req.data.user.name).broadcast('change', new message('timers:add', timer));
				});
			}else{
				error("Der Timer mit der ID " + data.id + " konnte nicht geschaltet werden");
			}
		});
	},
	switchAll: function(req){
		timerFunctions.switchActions(req.data.switchAll,true, true);
	}
});

app.io.route('group', {
	get:function(req){
		groupFunctions.getGroup(req.data, function(data){
			req.io.emit('change', new message('group:get', data));
		});
	},
	add: function(req){
		groupFunctions.saveNewGroup(req.data, function(err, data){
			req.io.room(req.data.user.name).broadcast('change', new message('group:add', data));
		});
	},
	edit: function(req){
		groupFunctions.saveEditGroup(req.data.edit, function(err, data){
			req.io.room(req.data.user.name).broadcast('change', new message('group:add', data));
		});
	},
	remove: function(req){
		groupFunctions.deleteGroup(req.data.remove, function(data){
			if(data != 200){
				error( "Die Gruppe mit der ID " + req.data.remove + " konnte nicht gelöscht werden!");
			}else{
				app.io.room(req.data.user).broadcast('change', new message('group:remove', req.data));
			}
		});
	}
});

app.io.route('groups', {
	get: function(req){
		groupFunctions.getGroups(user.name, function(data){
			req.io.emit('change', new message('groups:get', data));
		});
	},
	getAll:function(req){
		groupFunctions.getAllGroups(function(data){
			req.io.emit('change', new message('groups:get', data));
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

// app.io.route('adapters', {
// 	get:function(req){
// 		adapterFunctions.get(function(data){
// 			req.io.emit('change', new message('get', data));
// 		});
// 	},
// 	remove:function(req){
// 		adapterFunctions.remove(req.data, function(status){});
// 	},
// 	install:function(req){
// 		adapterFunctions.install(req.data, function(status){});
// 	},
// 	restart:function(req){
// 		adapterFunctions.restart(req.data, function(status){});
// 	},
// 	start:function(req){
// 		adapterFunctions.start(req.data, function(status){});
// 	},
// 	stop:function(req){
// 		adapterFunctions.stop(req.data, function(status){});
// 	}
// });


app.get('/pc', function(req, res) {
	res.sendfile(__dirname + '/public/pc/index.html');
})

app.get('/settings', function(req, res) {
	res.sendfile(__dirname + '/public/settings/index.html');
})

app.get('/mobile', function(req, res) {
	res.sendfile(__dirname + '/public/mobile/index.html');
})

app.get('/tablet', function(req, res) {
	res.sendfile(__dirname + '/public/tablet/index.html');
})

app.get('/', function(req, res) {
	res.sendfile(__dirname + '/public/index.html');
})


require('./app/routes')(app, db);



try{
	app.listen(config.QuickSwitch.port | 1230);
	console.log("Der Server läuft auf Port:" + (config.QuickSwitch.port | 1230));
}catch(err){
	console.log(err);
}

// Andere Dateien starten
var plugins = {};
var log_file = {};
var data = [
	"timerserver.js",
	"countdownserver.js",
	"SwitchServer/adapter.js",
];

data.forEach(function(file){
	var splitedfile 			= file.split(".");
	if(splitedfile[0].includes("/")){
		var name 				= splitedfile[0].split("/");
		var filename 			= name[name.length - 1];
	}else{
		var filename 			= splitedfile[0];
	}
	var debugFile 				= __dirname + '/log/debug-' + filename + '.log';
	log_file[filename]			=	fs.createWriteStream( debugFile, {flags : 'w'});

	if(fs.existsSync(__dirname + "/SwitchServer/settings/" + filename.toLowerCase() + ".json")){
		var bla 				= fs.readFileSync(__dirname + "/SwitchServer/settings/" + filename.toLowerCase() + ".json", "utf8");
		var ich 				= [];
		ich.push(bla);
		plugins[filename] 		= fork( './' + file, ich );
	}else{
		plugins[filename] 		= fork( './' + file);
	}

	plugins[filename].on('message', function(response) {
		if(response.log){
			log_file[filename].write(response.log.toString() + "\n");
		}
	});
});

function message(type, data){
	var message = {};
	var foo = type.split(':');
	message.masterType = foo[0];
	message.type = foo[1];
	message[foo[1]] = data;
	return message;
}