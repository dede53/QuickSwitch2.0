var db 				= require('./database.js');
var helper 			= require('../functions/helper.js');
var request 		= require('request');
var conf 			= require('./../../config.json');
module.exports = {
	sendto: function (app, req, action, data, callback){

		if(action == "toggle"){
			if(data.status == "0"){
				action = 1;
			}else{
				action = 0;
			}
		}

		request.post({
			url:'http://' + conf.switchserver[data.switchserver].ip + ':' + conf.switchserver[data.switchserver].port + '/switch/',
			form:
				{
					status: action,
					device: data
				}
		},function( err, httpResponse, body){
			if(err){
				helper.log("Error! \n SwitchServer ist nicht erreichbar!", "error");
				helper.log("Sicher das du den SwitchServer gestartet hast?", "info");
				helper.log( err , "error");
			}else{

				var query = "UPDATE devices SET status = '"+ action +"' WHERE deviceid = "+ data.deviceid +";";
				db.all(query, function(err, response){
					if(err){
						console.log(err);
						callback(404);
					}else{
						app.io.broadcast('switchDevice', {"device":data,"status":action});

						var query = "SELECT devices.name, rooms.name AS room FROM devices, rooms WHERE devices.roomid = rooms.id AND status != 0;";
						db.all(query , function(err, activedevices) {
							if (err) {
								console.log(err);
								callback(404);
							}else{
								app.io.broadcast('activedevices', {
									"activedevices": activedevices
								});
								helper.log("Erfolgreich an den SwitchServer gesendet und die Liste der aktiven Geräte aktualisiert! ", "info");
								callback(200);
							}
						});
					}
					
				});
				
			}
		});
	},
	sendActiveDevices: function (app, callback){
		var query = "SELECT devices.name, rooms.name AS room FROM devices, rooms WHERE devices.roomid = rooms.id AND status != 0;";
		db.all(query , function(err, activedevices) {
			if (err) {
				console.log(err);
				callback(404);
			}else{
				app.io.broadcast('activedevices', {
					"activedevices": activedevices
				});
				callback(200);
			}
		});
	}
}