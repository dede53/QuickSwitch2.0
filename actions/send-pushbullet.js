var PushBullet 					= require('pushbullet');
var variableFunctions 			= require("../app/functions/variable.js");
var conf 						= require('../config.json');

var QSiden 						= conf.pushbullet.source_device_iden;
var apiKey 						= conf.pushbullet.PushbulletAPIKey;

process.on('message', function(data) {
	var status = data.status;
	var data = data.data;
	console.log(data);
	sendPushMessage(status, data);
	/*
		{
			"protocol": 		"send-pushbullet",
			"title": 			"Titel",
			"message": 			"Nachricht",
			"receiver": 		"pushbullet iden"
		}
	*/
});

function sendPushMessage(status, data){
	var pusher = new PushBullet(apiKey);

	variableFunctions.replaceVar(data.message, function(nachricht){
		variableFunctions.replaceVar(data.title, function(title){
			data.message = nachricht;
			data.title = title;
			if(QSiden == "" || QSiden == null){
				pusher.createDevice('QuickSwitch', function(error, response) {
					helper.log("Pushbullet-Gerät angelegt mit der IDEN: " + response.iden);
					
					// Hier den DeviceIDEN der Config hinzufügen!
					
					data.source_device_iden = response.iden;
					pushMessage(data, pusher);
				});
			}else{
				data.source_device_iden = QSiden;
				pushMessage(data, pusher);
			}	
		});
	});
}

function pushMessage(data, pusher){
	console.log(data);
	var options = {
		'receiver_iden': data.receiver,
		'source_device_iden': data.source_device_iden
	}
	pusher.note( options , data.title , data.message , function(error, response) {
		console.log("Erfolgreich gesendet: " + data.message);
	});
}