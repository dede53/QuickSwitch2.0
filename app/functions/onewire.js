
var conf 			= require('./../../config.json');
var w1bus			= require('node-w1bus');
var request 		= require('request');
var bus				= w1bus.create();
var config			= bus.getConfig();

module.exports = {
	saveSensors : function(){
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
}