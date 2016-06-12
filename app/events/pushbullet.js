var PushBullet 					= require('pushbullet');
var request 					= require('request');
var helper 						= require('../functions/helper.js');
var lastMessage					= false;
var conf 						= require('./../../config.json');
var QSiden 						= conf.pushbullet.source_device_iden;
var apiKey 						= conf.pushbullet.PushbulletAPIKey;
var pusher 						= new PushBullet(apiKey);


var stream = pusher.stream();
stream.connect();

stream.on('connect', function() {
	helper.log.info("Connected to Pushbullet", "info");
});

stream.on('close', function() { 
});

stream.on('error', function(error) {
	helper.log.error("Error:" + error);
});

stream.on('message', function(data){
	// console.log(data);
});

stream.on('tickle', function(type) {
	var options = {
		limit: 1,
		modified_after: 1400000000.00000
	};
	pusher.history(options, function(error, response) {
		if(error){
			helper.log.error(error);
			return;
		}
		helper.log.debug(response);
		if(lastMessage != response.pushes[0].body && response.pushes[0].target_device_iden == QSiden){
			if(!response.pushes[0].title){
				response.pushes[0].title = "Pushbullet";
			}
			
			helper.setVariable('pushbulletLastTitle', response.pushes[0].title);
			helper.setVariable('pushbulletLastMessage', response.pushes[0].body);
			lastMessage = response.pushes[0].body;
		}
	});
});
