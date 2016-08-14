var rpc 			= require('homematic-xmlrpc');
var conf 			= require('../config.json');
var homematic 		= conf.homematic;

var rpcClient = rpc.createClient({
	host: homematic.ip,
	port: homematic.port,
	path: '/'
});

process.on('message', function(data) {
	setHomematic(data.status, data.data);
});



// setHomematic('up', 'NEQ0352473:1');
// setTimeout(function(){
// 	setHomematic('stop', 'NEQ0352473:1');
// 	setHomematic('down', 'NEQ0352473:1');
// }, 5000);


function setHomematic(status, device){
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
}

