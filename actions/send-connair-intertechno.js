var dgram       = require('dgram');

process.on('message', function(data) {
	var status = data.status;
	var data = data.data;
	sendUDP(status, data);
});

function sendUDP(status, data){
	var msg = connair_create_msg_intertechno(status, data);
	
	// dgram Klasse für UDP-Verbindungen
	var client = dgram.createSocket('udp4'); // Neuen Socket zum Client aufbauen
	client.send(msg, 0, msg.length, connair.port, connair.ip, function(err, bytes) 
	{
		console.log('UDP message sent to ' + connair.ip +':'+ connair.port +'; \n Folgendes wurde gesendet:' + msg); // Ausgabe der Nachricht
		client.close(); // Bei erfolgreichen Senden, die Verbindung zum CLient schließen
	});
}


function connair_create_msg_intertechno(status, data) {

	sA=0;
	sG=0;
	sRepeat=12;
	sPause=11125;
	sTune=89;
	sSpeed=32; //erfahrung aus dem Forum auf 32 stellen http://forum.power-switch.eu/viewtopic.php?f=15&t=146
	uSleep=800000;
	HEAD = "TXP:"+ sA +","+ sG +","+ sRepeat +","+ sPause +","+ sTune +",25,";
	TAIL = "1,"+ sSpeed +",;";
	AN="12,4,4,12,12,4";
	AUS="12,4,4,12,4,12";
	bitLow=4;
	bitHgh=12;
	seqLow = bitHgh + "," + bitHgh + "," + bitLow + "," + bitLow + ",";
	seqHgh = bitHgh + "," + $bitLow + "," + bitHgh + "," + bitLow + ",";
	msgM="";
	switch (data.CodeOn.toUpperCase()) {
		case "A":
			msgM = seqHgh + seqHgh + seqHgh + seqHgh;
			break;
		case "B":
			msgM + seqLow + seqHgh + seqHgh + seqHgh;
			break;   
		case "C":
			msgM + seqHgh + seqLow + seqHgh + seqHgh;
			break; 
		case "D":
			msgM + seqLow + seqLow + seqHgh + seqHgh;
			break;
		case "E":
			msgM + seqHgh + seqHgh + seqLow + seqHgh;
			break;
		case "F":
			msgM + seqLow + seqHgh + seqLow + seqHgh;
			break;
		case "G":
			msgM + seqHgh + seqLow + seqLow + seqHgh;
			break;
		case "H":
			msgM + seqLow + seqLow + seqLow + seqHgh;
			break;
		case "I":
			msgM + seqHgh + seqHgh + seqHgh + seqLow;
			break;
		case "J":
			msgM + seqLow + seqHgh + seqHgh + seqLow;
			break;
		case "K":
			msgM + seqHgh + seqLow + seqHgh + seqLow;
			break;
		case "L":
			msgM + seqLow + seqLow + seqHgh + seqLow;
			break;
		case "M":
			msgM + seqHgh + seqHgh + seqLow + seqLow;
			break;
		case "N":
			msgM + seqLow + seqHgh + seqLow + seqLow;
			break;
		case "O":
			msgM + seqHgh + seqLow + seqLow + seqLow;
			break;
		case "P":
			msgM + seqLow + seqLow + seqLow + seqLow;
			break;
	}
	msgS="";   
	switch (data.CodeOff){
		case "1":
			msgS = seqHgh + seqHgh + seqHgh + seqHgh;
			break;
		case "2":
			msgS = seqLow + seqHgh + seqHgh + seqHgh;
			break;   
		case "3":
			msgS = seqHgh + seqLow + seqHgh + seqHgh;
			break; 
		case "4":
			msgS = seqLow + seqLow + seqHgh + seqHgh;
			break;
		case "5":
			msgS = seqHgh + seqHgh + seqLow + seqHgh;
			break;
		case "6":
			msgS = seqLow + seqHgh + seqLow + seqHgh;
			break;
		case "7":
			msgS = seqHgh + seqLow + seqLow + seqHgh;
			break;
		case "8":
			msgS = seqLow + seqLow + seqLow + seqHgh;
			break;
		case "9":
			msgS = seqHgh + seqHgh + seqHgh + seqLow;
			break;
		case "10":
			msgS = seqLow + seqHgh + seqHgh + seqLow;
			break;
		case "11":
			msgS = seqHgh + seqLow + seqHgh + seqLow;
			break;
		case "12":
			msgS = seqLow + seqLow + seqHgh + seqLow;
			break;
		case "13":
			msgS = seqHgh + seqHgh + seqLow + seqLow;
			break;
		case "14":
			msgS = seqLow + seqHgh + seqLow + seqLow;
			break;
		case "15":
			msgS = seqHgh + seqLow + seqLow + seqLow;
			break;
		case "16":
			msgS = seqLow + seqLow + seqLow + seqLow;
			break;
	}
	if(status == "ON") {
		return HEAD + bitLow + "," + msgM + msgS + seqHgh + seqLow + bitHgh + "," + AN + TAIL;
	} else {
		return HEAD + bitLow + "," + msgM + msgS + seqHgh + seqLow + bitHgh + "," + AUS + TAIL;
	}
}