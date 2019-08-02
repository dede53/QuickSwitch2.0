var switchServerFunctions	=	require('../functions/SwitchServer.js');
var countdownFunctions		=	require('../functions/countdown.js');
var deviceFunctions			=	require('../functions/device.js');
var groupFunctions			=	require('../functions/group.js');
var messageFunctions		=	require('../functions/message.js');
var roomFunctions			=	require('../functions/room.js');
var userFunctions			=	require('../functions/user.js');
var variableFunctions		=	require('../functions/variable.js');

function message(type, data){
	var message = {};
	var foo = type.split(':');
	message.masterType = foo[0];
	message.type = foo[1];
	message[foo[1]] = data;
	return message;
}

module.exports = function(app, log, allAlerts, allTimers, allVariables){
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

				allTimers.getUserTimers(user.name, (data) => {
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
						log.error(req, "Der Raum enthält Geräte und kann nicht gelöscht werden!");
						break;
					default:
						log.error(req, status);
						break;
				}

			});
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
            if(req.data.id){
                app.io.emit('change', new message('variables:add', req.data));
            }else{
                app.io.emit('change', new message('variables:edit', req.data));
            }
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
		chartNew: function(req){
			console.log("chartNew");
			console.log(req.data);
			if(req.data.user.varChart.length == 0){
				return;
			}
			req.data.user.varChart.forEach(function(variable){
				console.log(variable);
				allVariables.getHistory(variable, req.data.start, req.data.end, (data) => {
					console.log(data);
					req.socket.emit('change', new message('varChartSerie:get', data));
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
					log.error(err);
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
				switchServerFunctions.sendto(undefined, "nada", {
					"type": "object",
					"protocol": "telegram:send",
					"message": data.message,
					"user": data.author,
					"receiver": undefined,
					"switchserver": 0,
					"date": new Date(),
					"id": Math.floor((Math.random() * 100) + 1)
				}, function(status){
					app.io.emit('change', new message('chatMessages:unshift', savedMessage));
				});
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
			userFunctions.deleteUser(req.data.remove, function(status){
				if(status == "200"){
					userFunctions.getUsers(function(data){
						app.io.emit('change', new message('users:get', data));
					});
				}else{
					log.error("User mit der ID " + req.data.remove + "konnte nicht gelöscht werden!");
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
					log.error( err );
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
			log.debug("io.route.timers.save");
			allTimers.saveTimer(req.data.save, function(err, data){
				app.io.in(req.data.save.user).emit('change', new message('timers:add', data));
			});
		},
		remove: function(req){
			log.debug("io.route.timers.remove");
			allTimers.deleteTimer(req.data.remove.id, function(err, data){
				app.io.emit("change", new message('timers:remove', req.data.remove.id));
			});
		},
		get: function(req){
			log.debug("io.route.timers.get");
			req.socket.emit('change', 
				new message(
					'timer:get',
					allTimers.getTimer(req.data.get)
				)
			);
		},
		switch: function(req){
			log.debug("io.route.timers.switch");
			allTimers.setActive(req.data.switch);
			app.io.emit('change', new message('timers:edit', req.data.switch));
		},
		switchAll: function(req){
			log.debug("io.route.timers.switchActions");
			allTimers.switchActions(req.data.switchAll);
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
					log.error( "Die Gruppe mit der ID " + req.data.remove + " konnte nicht gelöscht werden!");
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