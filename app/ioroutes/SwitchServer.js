<<<<<<< HEAD
var helper = require('../functions/helper.js');

module.exports = function(app ){

	var deviceFunctions = require('../functions/device.js');

	app.io.broadcast('switchDevice', {"device":data,"status":action});
	
	request.post({
		url:'http://192.168.2.47:4040/switch/',
		form:
			{
				status: action,
				device: data
			}
	},function( err, httpResponse, body){
		if(err){
			log("Error! \n SwitchServer ist nicht erreichbar!", "error");
			log("Sicher das du den SwitchServer gestartet hast?", "info");
			log( err , "error");
		}else{
			log("Erfolgreich an den SwitchServer gesendet", "info");
			deviceFunctions.sendActiveDevices(function(err){
				if(err != 200){
					log("Error: Liste der aktiven Geräte konnte nicht gesendet werden" + err , error);
				}
			});
		}
	});
=======
var helper = require('../functions/helper.js');

module.exports = function(app ){

	var deviceFunctions = require('../functions/device.js');

	app.io.broadcast('switchDevice', {"device":data,"status":action});
	
	request.post({
		url:'http://192.168.2.47:4040/switch/',
		form:
			{
				status: action,
				device: data
			}
	},function( err, httpResponse, body){
		if(err){
			log("Error! \n SwitchServer ist nicht erreichbar!", "error");
			log("Sicher das du den SwitchServer gestartet hast?", "info");
			log( err , "error");
		}else{
			log("Erfolgreich an den SwitchServer gesendet", "info");
			deviceFunctions.sendActiveDevices(function(err){
				if(err != 200){
					log("Error: Liste der aktiven Geräte konnte nicht gesendet werden" + err , error);
				}
			});
		}
	});
>>>>>>> af97e501eae31491992417dd0f792413c9d64b8f
}