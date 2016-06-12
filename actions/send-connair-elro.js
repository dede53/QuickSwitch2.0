var dgram       = require('dgram');

process.on('message', function(data) {
	var status = data.status;
	var data = data.data;
	sendUDP(status, data);
});

function sendUDP(status, data){
	var msg = connair_create_msg_elro(status, data);
	
	// dgram Klasse für UDP-Verbindungen
	var client = dgram.createSocket('udp4'); // Neuen Socket zum Client aufbauen
	client.send(msg, 0, msg.length, connair.port, connair.ip, function(err, bytes) 
	{
		console.log('UDP message sent to ' + connair.ip +':'+ connair.port +'; \n Folgendes wurde gesendet:' + msg); // Ausgabe der Nachricht
		client.close(); // Bei erfolgreichen Senden, die Verbindung zum CLient schließen
	});
}



function connair_create_msg_elro(status, data) {

	sA=0;
	sG=0;
	sRepeat=10;
	sPause=5600;
	sTune=350;
	sSpeed=16;
	uSleep=800000;
	HEAD = "TXP:"+ sA +","+ sG +","+ sRepeat +","+ sPause +","+ sTune +",25,";
	TAIL = "1,"+ sSpeed +";";
	
	AN="1,3,1,3,1,3,3,1,";
	AUS="1,3,3,1,1,3,1,3,";
	bitLow=1;
	bitHgh=3;
	seqLow = bitLow + "," + bitHgh + "," + bitLow + "," + bitHgh + ",";
	seqHgh = bitLow + "," + bitHgh + "," + bitHgh + "," + bitLow + ",";
	bits = data.CodeOn;
	msg="";
	for(i=0; i < bits.length; i++) {
		bit = bits.substr(i,1);
		if( bit == "1") {
			msg = msg + seqLow;
		} else {
			msg = msg + seqHgh;
		}
	}
	msgM = msg;
	bits = data.CodeOff;
	msg="";
	for(i=0; i < bits.length; i++) {
		bit = bits.substr(i,1);
		if( bit == "1") {
			msg = msg + seqLow;
		} else {
			msg = msg + seqHgh;
		}
	}
	msgS = msg;
	if( status == 1) {
		return HEAD + msgM + msgS + AN + TAIL;
	} else {
		return HEAD + msgM + msgS + AUS + TAIL;
	}
}