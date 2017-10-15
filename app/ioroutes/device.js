var config					=	require("./../../config.json");
var switchServerFunctions	=	require('../functions/SwitchServer.js');
var db						=	require('../functions/database.js');
var countdownFunctions		=	require('../functions/countdown.js');
var deviceFunctions			=	require('../functions/device.js');
var groupFunctions			=	require('../functions/group.js');
var messageFunctions		=	require('../functions/message.js');
var roomFunctions			=	require('../functions/room.js');
var timerFunctions			=	require('../functions/timer.js');
var adapterFunctions		=	require('../functions/adapter.js');
var userFunctions			=	require('../functions/user.js');
var variableFunctions		=	require('../functions/variable.js');
var fs						=	require('fs');
var helper					=	require('../functions/helper');

function message(type, data){
	var message = {};
	var foo = type.split(':');
	message.masterType = foo[0];
	message.type = foo[1];
	message[foo[1]] = data;
	return message;
}

module.exports = function(app, db, plugins, errors, log, allAlerts){
	// Setup the ready route, join room and broadcast to room.
	app.io.route('room', {
		join: function(req) {
			if(req.data != null){
				var user = req.data;
				log.debug("join:" + user.name);
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
				if(Array.isArray(user.favoritVariables)){
					variableFunctions.favoritVariables(user.favoritVariables, "object", function(data){
						req.socket.emit('change', new message('favoritVariables:get', data));
					});
				}
				if(allAlerts.alerts[user.name]){
					req.socket.emit('change', new message('alerts:get', allAlerts.alerts[user.name]));
				}else{
					req.socket.emit('change', new message('alerts:get', {}));
				}
			}
		},
		leave: function(req) {
			//log.debug("leave:" + req.data.name);
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
			roomFunctions.deleteRoom(req.data.remove.id, function(status){
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
						log.error(req, "Der Raum enthält Geräte und kann nicht gelöscht werden!");
						break;
					default:
						log.error(req, status);
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
					log.error("Die Einstellungen konnten nicht gespeichert werden!");
					log.error(err);
				}else{
					// db	=	require('./app/functions/database.js');
					app.io.emit('change', new message('settings:get', req.data));
					if(req.data.QuickSwitch.port != config.QuickSwitch.port){
						log.error("Die Einstellungen wurden geändert! Die aussteuerung ist nun unter folgender addresse zu erreichen: <a href='http://"+req.data.QuickSwitch.ip +":"+req.data.QuickSwitch.port+"'>QuickSwitch</a>");
						stopServer(function(){
							startServer(req.data.QuickSwitch.port);
						});
					}else{
						config = req.data;
					}
				}
			});
		},
		errors: function(req){
			req.socket.emit('serverErrors', errors);
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
			plugins.timerserver.send({"saveVariable": req.data});
			// variableFunctions.saveVariable(req.data, function(data, newVariable){
            if(req.data.id){
                app.io.emit('change', new message('variables:add', req.data));
            }else{
                app.io.emit('change', new message('variables:edit', req.data));
            }
			// });
		}
	});
	app.io.route('variables', {
		add: function(req){
			variableFunctions.saveNewVariable(req.data.add, function(err, data){
				app.io.emit('change', new message('variables:add', data));
			});
		},
		remove: function(req){
			variableFunctions.deleteVariable(req.data.remove.id, function(data){
				app.io.emit('change', new message('variables:remove', req.data.remove.id));
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
			userFunctions.getUser(req.data.user, function(user){
				variableFunctions.getStoredVariables(user, req.data.hours, function(data){
					req.socket.emit('change', new message('varChart:get', data));
				});
			});
		},
		storedVariable: function(req){
			variableFunctions.getStoredVariable(req.data.id, req.data.hours, function(data){
				req.socket.emit('change', new message('storedVariable:get', data));
			});
		}
	});

	app.io.route('rooms', {
		remove: function(req){
			roomFunctions.deleteRoom(req.data.remove.id, function(err){
				app.io.emit('change', new message('rooms:remove', req.data.remove.id));
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
					log.error(err + "Raum konnte nicht geschaltet werden");
				}
			});
		}
	});

	app.io.route('alerts', {
		add: function(req){
			allAlerts.add(req.data);
		},
		remove: function(req){
			allAlerts.remove(req.data.remove);
		},
		removeAll: function(req){
			allAlerts.removeAll(req.data.user.name);
		},
		addAll: function(req){
			allAlerts.addAll(req.data);
		}
	});

	app.io.route('messages', {
		add: function(req){
			var data = req.data.add;
			data.author = req.data.user.name;
			data.time = new Date().getTime();
			messageFunctions.saveMessage(data, function(err, savedMessage){
				app.io.emit('change', new message('chatMessages:unshift', savedMessage));
			});
		},
		loadOld: function(req){
			messageFunctions.loadOldMessages(req.data, function(data){

				data.messages.forEach(function(mess){
					req.socket.emit('change', new message('chatMessages:push', mess));
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
			userFunctions.deleteUser(req.data.remove.id, function(status){
				if(status == "200"){
					userFunctions.getUsers(function(data){
						app.io.emit('change', new message('users:get', data));
					});
				}else{
					log.error("User mit der ID " + req.data.remove.id + "konnte nicht gelöscht werden!");
				}
			});
		},
		save: function(req){
			userFunctions.saveUser(req.data.save, function(status){
				userFunctions.getUsers(function(data){
					app.io.emit('change', new message('users:get', data));
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
					log.error("Countdown konnte nicht gespeichert werden!");
					console.log("Countdown konnte nicht gespeichert werden!");
					console.log( err );
				}else{
					app.io.in(req.data.user.name).emit('change', new message('countdowns:add', savedCountdown));
				}
			});
		},
		remove: function(req){
			var id = req.data.remove.id;
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

	/*app.io.route('objects', {
		get: function(req){
			req.socket.emit('change', new message('objects:get', allObjects));
		}
	});*/

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
					//log.error( "Gerät mit der ID " + id + " konnte nicht geschaltet werden!");
				}
			});
			// allObjects[req.data.switch.id].switch(req.data.switch.status, app);
		},
		switchAll: function(req){
			deviceFunctions.switchDevices(app, req.data.switchAll, req, function(err){
				if(err != 200){
					log.error("Die Geräte konnten nicht geschaltet werden: " + req.data.switchAll);
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
			deviceFunctions.deleteDevice(req.data.remove.id, function(data){
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
				app.io.in(req.data.save.user).emit('change', new message('timers:add', data));
				plugins.timerserver.send({"loadTimers":true});
			});
		},
		remove: function(req){
			// plugins.timerserver.send({deaktivateInterval:req.data.remove});
			setTimeout(function(){
				timerFunctions.deleteTimer(req.data.remove.id, function(err, data){
					app.io.emit("change", new message('timers:remove', req.data.remove.id));
				});
			}, 1000);
		},
		get: function(req){
			console.log(req.data.get);
			timerFunctions.getTimer(req.data.get, function(timer){
				req.socket.emit('change', new message('timer:get', timer));
			});
		},
		switch: function(req){
			plugins.timerserver.send({setTimerActive: req.data.switch});
			app.io.emit('change', new message('timers:edit', req.data.switch));
		},
		switchAll: function(req){
			plugins.timerserver.send({switchActions: req.data.switchAll});
			// timerFunctions.switchActions(req.data.switchAll, true, true);
		}
	});

	app.io.route('group', {
		get:function(req){
			groupFunctions.getGroup(req.data, function(data){
				req.socket.emit('change', new message('group:get', data));
			});
		},
		remove: function(req){
			groupFunctions.deleteGroup(req.data.remove.id, function(data){
				if(data != 200){
					log.error( "Die Gruppe mit der ID " + req.data.remove.id + " konnte nicht gelöscht werden!");
				}else{
					groupFunctions.getAllGroups(function(data){
						req.socket.emit("change", new message('groups:get', data));
					});
					groupFunctions.getGroups(req.data.user, function(data){
						app.io.in(req.data.user).emit('change', new message('groups:get', data));
					});
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
					log.error( err + ":Die Gruppe mit der ID " + req.data.switch.group.id + " konnte nicht geschaltet werden!");
				}
			});
		}
	});
}