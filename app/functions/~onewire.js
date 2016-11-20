var conf 			= require('./../../config.json');
var request 		= require('request');
var w1bus			= require('node-w1bus');
var bus				= w1bus.create();
var config			= bus.getConfig();
var helper 			= require('./helper.js');

module.exports = {
	saveSensors : function(){
		helper.log.info("Lese Temperaturen aus den 1-Wiresensoren...");
		bus.listAllSensors().then(function(data){
			if(data.err){
				helper.log.error(data);
			}else{
				var opt_measureType = "temperature";
				data.ids.forEach(function(sensor){
					bus.getValueFrom(sensor, opt_measureType).then(function(res){
						if(res.err){
							helper.log.error(res);
						}else{
							// Ausgelesene Daten an die Datenbank schicken
							helper.log.debug(sensor + ':' + res.result.value);
							helper.setVariableByNodeid(sensor, res.result.value);
						}
					});	
				});
			}
		});
	}
}