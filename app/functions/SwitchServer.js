var db 				= require('./database.js');
var request 		= require('request');
var helper 			= require('../functions/helper.js');
var conf 			= require('./../../config.json');

function sendActiveDevices(app, callback){
	var query = "SELECT devices.name, rooms.name AS room FROM devices, rooms WHERE devices.roomid = rooms.id AND status != 0 AND devices.type = 'device' AND showStatus = 1;";
	db.all(query , function(err, activedevices) {
		if (err) {
			helper.log.error(err);
			callback(404);
		}else{
			app.io.broadcast('change', new helper.message('active:get', activedevices));
			helper.log.info("Erfolgreich an den SwitchServer gesendet und die Liste der aktiven Geräte aktualisiert! ");
			callback(200);
		}
	});
}

function saveStatus(app, action, data, callback){
	var query = "UPDATE devices SET status = '"+ action +"' WHERE deviceid = "+ data.deviceid +";";
	db.all(query, function(err, response){
		if(err){
			helper.log.error(err);
			callback(404);
		}else{
			app.io.broadcast('change', new helper.message("devices:switch", {"device":data,"status":action}));
			if(data.showStatus == 1 || data.showStatus == '1'){
				var query = "INSERT INTO `switch_history` (`deviceid`, `time`, `status`, `place`) VALUES ('" + data.deviceid + "', " + new Date().getTime() + ", '" + action + "', '" + data.name + "(" + data.Raum + ")');";
				db.run(query);
			}
			sendActiveDevices(app, function(data){
				callback(data);
			});
		}
	});
}
module.exports = {
	sendto: function (app, action, data, callback){
		// console.log(data);
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
					data: data
				}
		},function( err, httpResponse, body){
			if(err){
				helper.log.error("Error! \n SwitchServer ist nicht erreichbar!");
				helper.log.error(err);
			}else{
				if(data.type == "device"){
					saveStatus(app, action, data, function(data){
						callback(data);
					});
				}else{
					helper.log.info("Erfolgreich an den SwitchServer gesendet");
					callback(200);
				}
			}
		});
	},
	sendActiveDevices: sendActiveDevices
}