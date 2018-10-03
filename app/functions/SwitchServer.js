var db 				= require('./database.js');
var request 		= require('request');
var helper 			= require('../functions/helper.js');
var conf 			= require('./../../config.json');

function sendActiveDevices(app, callback){
	var query = "SELECT devices.name, rooms.name AS room FROM devices, rooms WHERE devices.roomid = rooms.id AND status != 0 AND devices.type = 'device' AND showStatus = 1;";
	db.all(query , function(err, activedevices) {
		if (err) {
			log.error(err);
			callback(404);
		}else{
			app.io.emit('change', new helper.message('active:get', activedevices));
			callback(200);
		}
	});
}

function saveStatus(app, data, callback){
	var query = "UPDATE devices SET status = '"+ data.newStatus +"' WHERE deviceid = "+ data.deviceid +";";
	db.all(query, function(err, response){
		if(err){
			log.error(err);
			callback(404);
		}else{
			if(data.type == "device" && (data.showStatus == 1 || data.showStatus == '1') ){
				app.io.emit('change', new helper.message("devices:switch", {"device":data,"status":data.newStatus}));
				var query = "INSERT INTO `switch_history` (`deviceid`, `time`, `status`, `place`) VALUES ('" + data.deviceid + "', " + new Date().getTime() + ", '" + data.newStatus + "', '" + data.name + "(" + data.Raum + ")');";
				db.run(query);
				sendActiveDevices(app, function(res){
					log.info("Erfolgreich an den SwitchServer gesendet: /switch/device/" + data.deviceid + "/" + data.newStatus);
					callback(res);
				});
			}
		}
	});
}
module.exports = {
	/*****************
	{
		id: integer
		protocol: pushbullet:send|connair:send|arduino:send|alert:add
		type: device|object
		switchserver: integer

		buttonlabelon: text
		buttonlabeloff: text
		showstatus: 0|1
		Raum
		roomid
		oncode
		offcode
		message
		user
		sendto
		status
		newStatus
		name
	}

	**************/
	sendto: function (app, action, data, callback){
		data.newStatus = action;
		request.post({
			url:'http://' + conf.switchserver[data.switchserver].ip + ':' + conf.switchserver[data.switchserver].port + '/switch',
			form: data
		},function( err, httpResponse, body){
			if(err){
				log.error("Der SwitchServer (" + err.address + ":" + err.port + ") ist nicht erreichbar! Schaue in die Einstellungen -> SwitchServer oder frage deinen Admin um Rat.");
			}else{
                switch(body){
                    case '400':
                        log.error("Kein Protocol für das Gerät " + data.name + "|" + data.Raum + " ausgewählt!");
                        break;
                    case '401':
                        log.error("Der SwitchServer (" + conf.switchserver[data.switchserver].ip + ":" + conf.switchserver[data.switchserver].port + ") hat keinen Adapter zum schalten installiert: " + data.protocol);
                        break;
                    default:
                        if(data.type == "device"){
                            log.info("Erfolgreich an den SwitchServer gesendet");
                            saveStatus(app, data, function(data){
                                if(callback){
                                    callback(data);
                                }
                            });
                        }else{
                            log.info("Erfolgreich an den SwitchServer gesendet");
                            if(callback){
                                callback(200);
                            }
                        }
                        break;
                }
				// if(body !== '200'){
                //     console.log(body);
				// 	log.error("Der SwitchServer [" + conf.switchserver[data.switchserver].ip + ':' + conf.switchserver[data.switchserver].port + "] meldet einen Fehler mit dem Adapter: " + data.protocol);
				// 	if(callback){
				// 		callback(body);
				// 	}
				// 	return;
                // }
			}
		});
	},
	sendActiveDevices: sendActiveDevices
}