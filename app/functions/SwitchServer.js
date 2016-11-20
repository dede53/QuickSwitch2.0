var db 				= require('./database.js');
var request 		= require('request');
var helper 			= require('../functions/helper.js');
var conf 			= require('./../../config.json');

<<<<<<< HEAD
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
=======
function saveStatus(app, req, action, data, callback){
	var query = "UPDATE devices SET status = '"+ action +"' WHERE deviceid = "+ data[data.type].deviceid +";";
>>>>>>> d3e70a1d720f830c1b7fd87dccb9dd8e639e7874
	db.all(query, function(err, response){
		if(err){
			helper.log.error(err);
			callback(404);
		}else{
<<<<<<< HEAD
			app.io.broadcast('change', new helper.message("devices:switch", {"device":data,"status":action}));
			if(data.showStatus == 1 || data.showStatus == '1'){
				var query = "INSERT INTO `switch_history` (`deviceid`, `time`, `status`, `place`) VALUES ('" + data.deviceid + "', " + new Date().getTime() + ", '" + action + "', '" + data.name + "(" + data.Raum + ")');";
				db.run(query);
			}
			sendActiveDevices(app, function(data){
				callback(data);
=======
			app.io.broadcast('switchDevice', {"device":data,"status":action});
			console.log(data[data.type]);
			if(data[data.type].showStatus == 1 || data[data.type].showStatus == '1'){
				var query = "INSERT INTO `switch_history` (`deviceid`, `time`, `status`, `place`) VALUES ('" + data[data.type].deviceid + "', " + new Date().getTime() + ", '" + action + "', '" + data[data.type].name + "(" + data[data.type].Raum + ")');";
				db.run(query);
			}
			var query = "SELECT devices.name, rooms.name AS room FROM devices, rooms WHERE devices.roomid = rooms.id AND status != 0 AND devices.type = 'device' AND showStatus = 1;";
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
>>>>>>> d3e70a1d720f830c1b7fd87dccb9dd8e639e7874
			});
		}
	});
}
module.exports = {
<<<<<<< HEAD
	sendto: function (app, action, data, callback){
		// console.log(data);
		if(action == "toggle"){
			if(data.status == "0"){
=======
	sendto: function (app, req, action, data, callback){
		// console.log(data);
		if(action == "toggle"){
			if(data[data.type].status == "0"){
>>>>>>> d3e70a1d720f830c1b7fd87dccb9dd8e639e7874
				action = 1;
			}else{
				action = 0;
			}
		}
		request.post({
<<<<<<< HEAD
			url:'http://' + conf.switchserver[data.switchserver].ip + ':' + conf.switchserver[data.switchserver].port + '/switch/',
			form:
				{
					status: action,
					data: data
=======
			url:'http://' + conf.switchserver[data[data.type].switchserver].ip + ':' + conf.switchserver[data[data.type].switchserver].port + '/switch/',
			form:
				{
					status: action,
					data: data[data.type]
>>>>>>> d3e70a1d720f830c1b7fd87dccb9dd8e639e7874
				}
		},function( err, httpResponse, body){
			if(err){
				helper.log.error("Error! \n SwitchServer ist nicht erreichbar!");
				helper.log.error(err);
			}else{
				if(data.type == "device"){
<<<<<<< HEAD
					saveStatus(app, action, data, function(data){
=======
					saveStatus(app, req, action, data, function(data){
>>>>>>> d3e70a1d720f830c1b7fd87dccb9dd8e639e7874
						callback(data);
					});
				}else{
					helper.log.info("Erfolgreich an den SwitchServer gesendet");
					callback(200);
				}
			}
		});
	},
<<<<<<< HEAD
	sendActiveDevices: sendActiveDevices
=======
	// sendto: function(app, req, action, data, callback){
	// 	try{
	// 		if(action == "toggle"){
	// 			if(data[data.type].status == "0"){
	// 				action = 1;
	// 			}else{
	// 				action = 0;
	// 			}
	// 		}

	// 		if(data.type == "device"){
	// 			saveStatus(app, req, action, data, function(data){
	// 				callback(data);
	// 			});
	// 		}else{
	// 			helper.log.info("Erfolgreich an den SwitchServer gesendet");
	// 			callback(200);
	// 		}

	// 		var transData = {
	// 			status: status,
	// 			data: data
	// 		}

	// 		plugins.autoloader.send(transData);

	// 	}catch(err){
	// 		console.log("Adapter zum schalten nicht installiert!");
	// 	}
	// },
	sendActiveDevices: function (app, callback){
		var query = "SELECT devices.name, rooms.name AS room FROM devices, rooms WHERE devices.roomid = rooms.id AND status != 0 AND devices.type = 'device' AND devices.showStatus = '1';";
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
>>>>>>> d3e70a1d720f830c1b7fd87dccb9dd8e639e7874
}