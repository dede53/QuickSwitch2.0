var rpc 						= require('homematic-xmlrpc');
var adapter 					= require('../../adapter-lib.js');

var homematic 					= new adapter({
	"name": "Homematic",
	"loglevel": 3,
	"description": "Bindet ein Homematicsystem ein.",
	"settingsFile": "homematic.json"
});

process.on('message', function(data) {
	var status = data.status;
	var data = data.data;

	setHomematic(data.status, data.data);
});



// setHomematic('up', 'NEQ0352473:1');
// setTimeout(function(){
// 	setHomematic('stop', 'NEQ0352473:1');
// 	setHomematic('down', 'NEQ0352473:1');
// }, 5000);


function setHomematic(status, device){
	homematic.settings.homematic.forEach(function(homematic){
		switch(status){
			case "stop":
				var parameter = "STOP";
				var value = false;
				break;
			case "1":
				var parameter = "LEVEL";
				var value = '100';
				break;
			case "0":
				var parameter = "LEVEL";
				var value = '0';
				break;
			default:
				console.log("Keine Aktion für Homematicaktoren und den Befehl: " + status);
				break;
		}
		try {
			var rpcClient = rpc.createClient({
				host: homematic.ip,
				port: homematic.port,
				path: '/'
			});
			// console.log(device);
			// console.log(device.CodeOn + "|" + parameter + "|" + value);
			if(device.CodeOn != undefined && parameter != undefined && value != undefined){
				rpcClient.methodCall('setValue', [device.CodeOn, parameter, value], function (err) {
					if(err)console.log(err);
				});
			}
		} catch (err) {
		    console.log('Init not possible, going to stop: ', err);
		}
	});
}

