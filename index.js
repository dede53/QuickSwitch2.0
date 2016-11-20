var express					=	require('express.io');
var app						=	express().http().io();

var switchServerFunctions 	= require('./app/functions/SwitchServer.js');
var db 						= require('./app/functions/database.js');
var countdownFunctions 		= require('./app/functions/countdown.js');
var deviceFunctions 		= require('./app/functions/device.js');
var groupFunctions 			= require('./app/functions/group.js');
var messageFunctions 		= require('./app/functions/message.js');
<<<<<<< HEAD
var roomFunctions 			= require('./app/functions/room.js');
=======
var phoneFunctions 			= require('./app/functions/phone.js');
var roomFunctions 			= require('./app/functions/room.js');
var temperatureFunctions 	= require('./app/functions/temperature.js');
>>>>>>> d3e70a1d720f830c1b7fd87dccb9dd8e639e7874
var timerFunctions 			= require('./app/functions/timer.js');
var userFunctions 			= require('./app/functions/user.js');
var variableFunctions 		= require('./app/functions/variable.js');

var fs 						=	require('fs');
var fork					=	require('child_process').fork;

var bodyParser				=	require('body-parser');
var cookieParser			=	require('cookie-parser');
<<<<<<< HEAD
=======
var multer					=	require('multer');
>>>>>>> d3e70a1d720f830c1b7fd87dccb9dd8e639e7874

// app.use(express.logger('dev'));
app.use(bodyParser.json()); 						// for parsing application/json
app.use(bodyParser.urlencoded({ extended: true }));	// for parsing application/x-www-form-urlencoded
<<<<<<< HEAD
=======
app.use(multer()); 									// for parsing multipart/form-data
>>>>>>> d3e70a1d720f830c1b7fd87dccb9dd8e639e7874
app.use(cookieParser());							// for parsing cookies
app.use(express.static(__dirname + '/public'));		// provides static htmls

if(!fs.existsSync("./log")){
	fs.mkdirSync("./log", 0766, function(err){
		if(err){
			console.log("mkdir ./log: failed: " + err);
		}
	});
}

<<<<<<< HEAD
=======
var plugins = {};
var log_file = {};
var data = [
	// "eventLoader.js",
	// "autoloader.js",
	"timerserver.js",
	"countdownserver.js",
	"adapter.js",
];

data.forEach(function(file){
	var splitedfile = file.split(".");
	var filename = splitedfile[0];
	var debugFile = __dirname + '/log/debug-' + filename + '.log';
	log_file[filename]			=	fs.createWriteStream( debugFile, {flags : 'w'});	

	plugins[filename] = fork( './' + file );
	plugins[filename].on('message', function(response) {
		if(response.log){
			log_file[filename].write(response.log.toString() + "\n");
		}
	});
});


>>>>>>> d3e70a1d720f830c1b7fd87dccb9dd8e639e7874
// Setup the ready route, join room and broadcast to room.
app.io.route('room', {
	join: function(req) {
		var user = req.data;
		console.log("join:" + user.name);
		req.io.join(user.name)
		req.io.room(user.name).broadcast('announce', {
			message: 'New client in the ' + req.data.name + ' room. '
		});

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
		
		variableFunctions.favoritVariables(user.variables, function(data){
			req.io.emit('change', new message('variables:get', data));
		});
		variableFunctions.getStoredVariables(user, function(data){
			req.io.emit('change', new message('varChart:chart', data));
		});
	},
	leave: function(req) {
		console.log("leave:" + req.data.name);
		req.io.leave(req.data.name);
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
		variableFunctions.saveNewVariable(req.data.add, function(err, data){
			app.io.broadcast('change', new message('variables:add', data));
		});
	},
	get: function(req){
		variableFunctions.getVariables(function(data){
			req.io.emit('change', new message('variables:get', data));
		});
	},
	favoriten: function(req){
		variableFunctions.favoritVariables(req.data.user.variables, function(data){
			req.io.emit('change', new message('variables:get', data));
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
		roomFunctions.getRooms('object', function(err){
			req.io.emit('change', new message('rooms:get', data));			
		});
	},
	switch: function(req){
		roomFunctions.switchRoom(req.data.switch.room, req.data.switch.status, app, function(err){
			if(err != 200){
				helper.log.error("Raum konnte nicht geschaltet werden");
			}
		});
	}
});

app.io.route('alerts', {
	add: function(req){
		app.io.room(req.data.user.name).broadcast('change', new message('alerts:add', req.data));
	},
	remove: function(req){
		app.io.room(req.data.user.name).broadcast('change', new message('alerts:remove', req.data.id));
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
			app.io.broadcast('change', new message('chat.messages:add', savedMessage));
		});
	},
	loadOld: function(req){
		messageFunctions.loadOldMessages(req.data, function(data){
			req.io.emit('change', new message('chat:get', data));
		});
	},
});

app.io.route('user', {
	add: function(){

	},
	remove: function(){

	},
	get: function(req){
		userFunctions.getUsers(function(data){
			req.io.emit('change', new message('users:get', data));
		});
	}
});

<<<<<<< HEAD
=======
app.io.route('calls', {
	get: function(req){
		phoneFunctions.getPhonelist(function(data){
			req.io.emit('change', new message('calls:get', data));
		});
	}
});

>>>>>>> d3e70a1d720f830c1b7fd87dccb9dd8e639e7874
app.io.route('countdowns', {
	add: function(req){
		var data = req.data.add;
		data.settime = new Date().getTime();		
		data.time = data.settime + (data.time * 60000);
		countdownFunctions.setNewCountdown(data, function(err, savedCountdown){
			if(err != "200"){
				helper.log.error("Countdown konnte nicht gespeichert werden!");
				helper.log.error( err );
			}else{
				app.io.room(req.data.user.name).broadcast('change', new message('countdowns:add', savedCountdown));
			}
		});
	},
	remove: function(req){
		var id = req.data.id;
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
		deviceFunctions.getDevices('object', function(data){
			req.io.emit('change', new message('devices:get', data));
		});
	},
	favoriten: function(req){
		deviceFunctions.favoritDevices(req.user.favoritDevices, function(data){
			req.io.emit('change', new message('favoritDevices:get', data));
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
				helper.log.error("Gerät konnte nicht geschaltet werden");
			}
		});
	},
	switchAll: function(req){
		deviceFunctions.switchDevices(app, req.data.switchAll, req, function(err){
			if(err != 200){
				helper.log.error("Die Geräte konnten nicht geschaltet werden");
			}
		});
	},
	devicelist: function(req){
		deviceFunctions.getDevices('array', function(data){
			req.io.emit('change', new message('devicelist:get', data));
		});
	}
});

app.io.route('switchHistory', {
	get: function(req){
		deviceFunctions.getSwitchHistoryByID(24, function(data){
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
	remove: function(req){
		timerFunctions.deleteTimer(req.data.remove, function(data){
			app.io.emit("change", new message('timers:remove', req.data.remove));
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
			}
		});
	},
	switchAll: function(req){
		timerFunctions.switchActions(req.data.switchAll,true, true);
	}
});

app.io.route('groups', {
	add: function(req){
		groupFunctions.saveNewGroup(req.data.add, function(err, data){
			req.io.room(req.data.user.name).broadcast('change', new message('group:add', data));
		});
	},
	edit: function(req){
		groupFunctions.saveEditGroup(req.data.edit, function(err, data){
			req.io.room(req.data.user.name).broadcast('change', new message('group:add', data));
		});
	},
	remove: function(req){
		var id = req.data.remove;
		groupFunctions.deleteGroup(id, function(data){
			if(data != 200){
				helper.log.error("Die Gruppe konnte nicht gelöscht werden!");
			}else{
				app.io.room(req.data.user.name).broadcast('change', new message('groups:remove', req.data.remove));
			}
		});
	},
	get: function(req){
		groupFunctions.getGroups(user.name, function(data){
			req.io.emit('change', new message('groups:get', data));
		});
	},
	switch: function(req){
		groupFunctions.switchGroup(app, req.data.switch.group, req.data.switch.status, function(err){
			if(err != 200){
				helper.log.error("Gruppe konnte nicht geschaltet werden");
			}
		});
	}
});

// Send the client html.
app.get('/pc', function(req, res) {
	res.sendfile(__dirname + '/public/pc/index.html');
})
// Send the client html.
app.get('/mobile', function(req, res) {
	res.sendfile(__dirname + '/public/mobile/index.html');
})

// Send the client html.
app.get('/tablet', function(req, res) {
	res.sendfile(__dirname + '/public/tablet/index.html');
})

app.get('/', function(req, res) {
	res.sendfile(__dirname + '/public/index.html');
})


require('./app/routes')(app, db);

<<<<<<< HEAD
// Server starten
try{
	var config = require("./config.json");
	app.listen(config.QuickSwitch.port | 1230);
=======
try{
	app.listen(1230);
>>>>>>> d3e70a1d720f830c1b7fd87dccb9dd8e639e7874
}catch(err){
	console.log(err);
}

<<<<<<< HEAD
// Andere Dateien starten
var plugins = {};
var log_file = {};
var data = [
	// "eventLoader.js",
	// "autoloader.js",
	"timerserver.js",
	"countdownserver.js",
	"adapter.js",
];

data.forEach(function(file){
	var splitedfile = file.split(".");
	var filename = splitedfile[0];
	var debugFile = __dirname + '/log/debug-' + filename + '.log';
	log_file[filename]			=	fs.createWriteStream( debugFile, {flags : 'w'});	

	plugins[filename] = fork( './' + file );
	plugins[filename].on('message', function(response) {
		if(response.log){
			log_file[filename].write(response.log.toString() + "\n");
		}
	});
});

=======
>>>>>>> d3e70a1d720f830c1b7fd87dccb9dd8e639e7874
function message(type, data){
	var message = {};
	var foo = type.split(':');
	message.masterType = foo[0];
	message.type = foo[1];
	message[foo[1]] = data;
	return message;
}