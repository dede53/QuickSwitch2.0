var dgram					=	require('dgram');

setInterval(function(){
	sendUDP("pilightRaw:0000010001010001000001000101000100010001000100010002:303,1113,8229::;");
	// sendUDP("pilightRaw:101000100010001000100010002:30311138229::");
}, 3* 1000);


function sendUDP(msg) {
	// arduino.settings.arduinos.forEach(function(device){
		var client = dgram.createSocket('udp4');
		client.send(msg, 0, msg.length, '49880', "192.168.2.27", function(err, bytes) 
		{
			console.log("udp://192.168.2.27:49880/ " + msg);
			client.close();
		});
	// });
}