var conf            = require('../config.json');
var connair         = conf.connair;
var dgram       	= require('dgram');

process.on('message', function(data) {
	var status = data.status;
	var data = data.data;
	// console.log(data);
	sendUDP(status, data);
});
// send-arduino-udp
function sendUDP(status, data){
	if(status == 1){
		var msg = "sendIr:NEC:" + data.CodeOn + ":32::";
	}else{
		var msg = "sendIr:NEC:" + data.CodeOff + ":32::";
	}
	
	// dgram Klasse für UDP-Verbindungen
	var client = dgram.createSocket('udp4'); // Neuen Socket zum Client aufbauen
	client.send(msg, 0, msg.length, connair.port, connair.ip, function(err, bytes) 
	{
		console.log('UDP message sent to ' + connair.ip +':'+ connair.port +'; \nFolgendes wurde gesendet:' + msg); // Ausgabe der Nachricht
		client.close(); // Bei erfolgreichen Senden, die Verbindung zum CLient schließen
	});
}