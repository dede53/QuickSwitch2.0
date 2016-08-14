var dgram       = require('dgram');

process.on('message', function(data) {
	var status = data.status;
	var data = data.data;
	sendRawUDP(status, data);
});

function sendRawUDP(status, data){
	if(status == 1){
		var msg = data.CodeOn;
	}else{
		var msg = data.CodeOff;
	}
	
	// dgram Klasse für UDP-Verbindungen
	var client = dgram.createSocket('udp4'); // Neuen Socket zum Client aufbauen
	client.send(msg, 0, msg.length, connair.port, connair.ip, function(err, bytes) 
	{
		console.log('UDP message sent to ' + connair.ip +':'+ connair.port +'; \n Folgendes wurde gesendet:' + msg); // Ausgabe der Nachricht
		client.close(); // Bei erfolgreichen Senden, die Verbindung zum CLient schließen
	});
}