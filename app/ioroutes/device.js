var helper = require('../functions/helper.js');

module.exports = function(app, db){

	var deviceFunctions = require('../functions/device.js');
	var SwitchServerFunctions = require('../functions/SwitchServer.js');
	/*********************************************************
	* Sendet die Gerätefavoriten zu dem neuen Benutzer
	*********************************************************/
	app.io.route('favoritDevices', function( req, res){
		var data = req.data;
		console.log(data);
		deviceFunctions.favoritDevices(data, req,res,function(data){
			req.io.emit('favoritDevices', data);
		});
	});

	app.io.route('sendActiveDevices',function(req, res){
		SwitchServerFunctions.sendActiveDevices(app, function(err){
			if(err != 200){
				helper.log.error("Error: Liste der aktiven Geräte konnte nicht gesendet werden" + err);
			}
		});
	});


	/*********************************************************
	* Speichert ein Gerät
	*********************************************************/
	app.io.route('saveDevice', function(req, res){
		if( !req.data.device.deviceid){
			console.log(req.data);
			var data = {
				"type": "device",
				"device":{
					"name": req.data.device.name,
					"buttonLabelOn": req.data.device.buttonLabelOn,
					"buttonLabelOff": req.data.device.buttonLabelOff,
					"CodeOn": req.data.device.CodeOn,
					"CodeOff": req.data.device.CodeOff,
					"protocol": req.data.device.protocol,
					"room": req.data.device.roomid,
					"switchserver": req.data.device.switchserver
				}
			};
			console.log(data);
			deviceFunctions.saveNewDevice(data, req, res, function(data){
				deviceFunctions.getDevices('object', req, res, function(data){
					app.io.broadcast('devices', data);
				});
			});
		}else{
			var data = 
				{
					"deviceid": req.data.device.deviceid,
					"name": req.data.device.name,
					"buttonLabelOn": req.data.device.buttonLabelOn,
					"buttonLabelOff": req.data.device.buttonLabelOff,
					"CodeOn": req.data.device.CodeOn,
					"CodeOff": req.data.device.CodeOff,
					"protocol": req.data.device.protocol,
					"room": req.data.device.roomid,
					"switchserver": req.data.device.switchserver
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
				helper.log.error(err);
			}
		});
	});

	/*********************************************************
	* Schaltet ein Gerät
	*********************************************************/
	app.io.route('switchdevice', function(req, res){
		var id = req.data.id;
		var status = req.data.status;
		console.log(status);
		deviceFunctions.switchDevice(app, id, status, req, res, function(err){
			if(err != 200){
				helper.log.error("Gerät konnte nicht geschaltet werden");
			}
		});
	});

	app.io.route('getSwitchHistory', function(req, res){
		console.log(req.data);
		deviceFunctions.getSwitchHistory(req.data, function(data){
			req.io.emit('switchHistory', data);
		});
	});
	app.io.route('getSwitchHistoryByID', function(req, res){
		// console.log(req.data);
		deviceFunctions.getSwitchHistoryByID(req.data, function(data){
			req.io.emit('switchHistoryByID', data);
		});
	});
}