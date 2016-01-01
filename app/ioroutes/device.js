var helper = require('../functions/helper.js');

module.exports = function(app, db){

	var deviceFunctions = require('../functions/device.js');
	var SwitchServerFunctions = require('../functions/SwitchServer.js');
	/*********************************************************
	* Sendet die Gerätefavoriten zu dem neuen Benutzer
	*********************************************************/
	app.io.route('favoritDevices', function( req, res){
		var data = req.data;		
		deviceFunctions.favoritDevices(data, req,res,function(data){
			req.io.emit('favoritDevices', data);
		});
	});

	app.io.route('sendActiveDevices',function(req, res){
		SwitchServerFunctions.sendActiveDevices(app, function(err){
			if(err != 200){
				console.log("Error: Liste der aktiven Geräte konnte nicht gesendet werden" + err);
			}
		});
	});


	/*********************************************************
	* Speichert ein Gerät
	*********************************************************/
	app.io.route('saveDevice', function(req, res){
		if( !req.data.deviceid){
			var data = {
				"name": req.data.name,
				"buttonLabelOn": req.data.buttonLabelOn,
				"buttonLabelOff": req.data.buttonLabelOff,
				"CodeOn": req.data.CodeOn,
				"CodeOff": req.data.CodeOff,
				"protocol": req.data.protocol,
				"room": req.data.roomid,
				"switchserver": req.data.switchserver
			};
			deviceFunctions.saveNewDevice(data, req, res, function(data){
				deviceFunctions.getDevices('object', req, res, function(data){
					app.io.broadcast('devices', data);
				});
			});
		}else{
			var data = 
				{
					"deviceid": req.data.deviceid,
					"name": req.data.name,
					"buttonLabelOn": req.data.buttonLabelOn,
					"buttonLabelOff": req.data.buttonLabelOff,
					"CodeOn": req.data.CodeOn,
					"CodeOff": req.data.CodeOff,
					"protocol": req.data.protocol,
					"room": req.data.roomid,
					"switchserver": req.data.switchserver
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
				console.log(err, "error");
			}
		});
	});

	/*********************************************************
	* Schaltet ein Gerät
	*********************************************************/
	app.io.route('switchdevice', function(req, res){
		var id = req.data.id;
		var status = req.data.status;
		deviceFunctions.switchDevice(app, id, status, req, res, function(err){
			if(err != 200){
				console.log("Gerät konnte nicht geschaltet werden");
			}
		});
	});
}