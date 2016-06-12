var dgram       = require('dgram');

process.on('message', function(data) {
	var status = data.status;
	var data = data.data;
	sendUDP(status, data);
});

function sendUDP(status, data){
	var msg = connair_create_msg_brennenstuhl(status, data);
	
	// dgram Klasse für UDP-Verbindungen
	var client = dgram.createSocket('udp4'); // Neuen Socket zum Client aufbauen
	client.send(msg, 0, msg.length, connair.port, connair.ip, function(err, bytes) 
	{
		console.log('UDP message sent to ' + connair.ip +':'+ connair.port +'; \n Folgendes wurde gesendet:' + msg); // Ausgabe der Nachricht
		client.close(); // Bei erfolgreichen Senden, die Verbindung zum CLient schließen
	});
}


function connair_create_msg_brennenstuhl(status, data) {
	console.log("Create ConnAir Message for Brennenstuhl device='"+ data.deviceid +"' action='"+ status +"'");  

	sA = 0;
	sG = 0;
	sRepeat = 10;
	sPause = 5600;
	sTune = 350;
	sBaud = "#baud#";
	sSpeed = 32;
	uSleep = 800000;
	// txversion=3;
	txversion = 1;
	HEAD = "TXP:"+ sA +","+ sG +","+ sRepeat +","+ sPause +","+ sTune +","+ sBaud +",";
	TAIL = ","+ txversion +",1,"+ sSpeed +",;";
	AN = "1,3,1,3,3";
	AUS = "3,1,1,3,1";
	bitLow = 1;
	bitHgh = 3;
	seqLow = bitHgh + "," + bitHgh + "," + bitLow + "," + bitLow + ",";
	seqHgh = bitHgh + "," + bitLow + "," + bitHgh + "," + bitLow + ",";
	bits = data.CodeOn;
	msg = "";
	for( i=0; i < bits.length; i++) {   
		bit = bits.substr(i,1);
		if(bit=="0") {
			msg = msg + seqLow;
		} else {
			msg = msg + seqHgh;
		}
	}
	msgM = msg;
	bits= data.CodeOff;
	msg="";
	for( i=0; i < bits.length; i++) {
		bit= bits.substr(i,1);
		if(bit=="0") {
			msg=msg + seqLow;
		} else {
			msg = msg + seqHgh;
		}
	}
	msgS = msg;
	if(status == 1) {
		return HEAD + bitLow + "," + msgM + msgS + bitHgh + "," + AN + TAIL;
	} else {
		return HEAD + bitLow + "," + msgM + msgS + bitHgh + "," + AUS + TAIL;
	}
}