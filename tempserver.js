/************************************************************

	Wird später in den Timerserver gegliedert!!!

************************************************************/

var conf 			=	require('./config.json');

var w1bus			= require('node-w1bus');
var request 		= require('request');
var later 			= require('later');
var bus				= w1bus.create();
var config			= bus.getConfig();



later.date.localTime();
var sched			= later.parse.text('every 1 min');
var timer 			= later.setInterval(readSensors, sched);



function readSensors(){
	console.log("Lese Temperaturen...");
	bus.listAllSensors().then(function(data){
		if(data.err){
			console.log(data);
		}else{
			var opt_measureType = "temperature";
			data.ids.forEach(function(sensor){
				bus.getValueFrom(sensor, opt_measureType).then(function(res){
					if(res.err){
						console.log(res);
					}else{
						res.result.id = sensor;
						res.result.value = Math.round(res.result.value * 100);

						// Ausgelesene Daten an die Datenbank schicken
						request.post({
							url:'http://' + conf.QuickSwitch.ip + ':' + conf.QuickSwitch.port + '/newdata/',
							form:
								{
									nodeID : res.result.id,
									supplyV : 2.2,
									temp : res.result.value,
									timestamp : res.result.timestamp
								}
						},function( err, httpResponse, body){
							if(err){
								console.log( err );
							}else{
								console.log( res.result.id + " gespeichert!");
							}
						});
					}
				});	
			});
		}
	});
}
/*
switch(timer.type){
	case"timer":
		break;
	case"interval":
		switch(timer.action){
			case"device":
				var function = function(timer.actionid){

				}
				break;
			case"room":
				break;
			case"group":
				break;
		}
		var temp = later.parse.text('every ' + timer.time.interval_number + ' ' + timer.time.interval_unit);
		var timerlist = later.setInterval(, temp);
		break;

}
*/