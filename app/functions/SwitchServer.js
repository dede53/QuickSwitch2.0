var db 				= require('./database.js');
var request 		= require('request');
var helper 			= require('../functions/helper.js');
var conf 			= require('./../../config.json');

function saveStatus(app, req, action, data, callback){
	var query = "UPDATE devices SET status = '"+ action +"' WHERE deviceid = "+ data[data.type].deviceid +";";
	db.all(query, function(err, response){
		if(err){
			helper.log.error(err);
			callback(404);
		}else{
			app.io.broadcast('switchDevice', {"device":data,"status":action});

			var query = "SELECT devices.name, rooms.name AS room FROM devices, rooms WHERE devices.roomid = rooms.id AND status != 0 AND devices.type = 'device';";
			db.all(query , function(err, activedevices) {
				if (err) {
					helper.log.error(err);
					callback(404);
				}else{
					app.io.broadcast('activedevices', {
						"activedevices": activedevices
					});
					helper.log.info("Erfolgreich an den SwitchServer gesendet und die Liste der aktiven Geräte aktualisiert! ");
					callback(200);
				}
			});
		}
	});
}
module.exports = {
	sendto: function (app, req, action, data, callback){
		// console.log(data);
		if(action == "toggle"){
			if(data[data.type].status == "0"){
				action = 1;
			}else{
				action = 0;
			}
		}
		request.post({
			url:'http://' + conf.switchserver[data[data.type].switchserver].ip + ':' + conf.switchserver[data[data.type].switchserver].port + '/switch/',
			form:
				{
					status: action,
					data: data[data.type]
				}
		},function( err, httpResponse, body){
			if(err){
				helper.log.error("Error! \n SwitchServer ist nicht erreichbar!");
				helper.log.error(err);
			}else{
				if(data.type == "device"){
					saveStatus(app, req, action, data, function(data){
						callback(data);
					});
				}else{
					helper.log.info("Erfolgreich an den SwitchServer gesendet");
					callback(200);
				}
			}
		});
	},
	sendActiveDevices: function (app, callback){
		var query = "SELECT devices.name, rooms.name AS room FROM devices, rooms WHERE devices.roomid = rooms.id AND status != 0 AND devices.type = 'device';";
		db.all(query , function(err, activedevices) {
			if (err) {
				helper.log.error(err);
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