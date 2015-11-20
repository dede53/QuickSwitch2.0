var helper 			= require('../functions/helper.js');
var request 		= require('request');
var conf 			= require('./../../config.json');
module.exports = {
	sendto: function (app, req, action, data, callback){
		app.io.broadcast('switchDevice', {"device":data,"status":action});
		
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
				helper.log("Erfolgreich an den SwitchServer gesendet", "info");
				callback(200);
			}
		});
	},
	sendActiveDevices: function (app, db, callback){
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