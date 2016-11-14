var w1bus					= require('node-w1bus');
var bus						= w1bus.create();
var config					= bus.getConfig();
var adapter 				= require('../../adapter-lib.js');
var onewire					= new adapter({
	"name": "Onewire",
	"loglevel": 3,
	"description": "Liest angeschlossene 1-Wire Sensoren aus.",
	"settingsFile": ""
});
// onewire.log.debug(config);

process.on('message', function(data) {
	var status = data.status;
	var data = data.data;
	saveSensors(status, data);
});

function saveSensors(status, data){
	onewire.log.info("Lese Temperaturen aus den 1-Wiresensoren...");
	bus.listAllSensors().then(function(data){
		if(data.err){
			onewire.log.error(data);
		}else{
			var opt_measureType = "temperature";
			data.ids.forEach(function(sensor){
				bus.getValueFrom(sensor, opt_measureType).then(function(res){
					if(res.err){
						onewire.log.error(res);
					}else{
						// Ausgelesene Daten an die Datenbank schicken
						onewire.log.debug(sensor + ':' + res.result.value);
						onewire.setVariable("onewire." + sensor, res.result.value);
					}
				});	
			});
		}
	});
}