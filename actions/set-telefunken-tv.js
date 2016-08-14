var conf			= require('../config.json');
var telefunken		= conf.telefunken;
var dgram			= require('dgram');
var net 		= require('net');
var queue		= [];
var busy 		= false;

process.on('message', function(data) {
	var status = data.status;
	var data = data.data;
	sendTelefunken(status, data);
});

function sendTelefunken(status, data){
	// console.log(data);
	if(status == 1){
		var command = data.CodeOn;
	}else{
		var command = data.CodeOff;
	}
	switch(command){
		case'volumeup':
			var code = "1016";
			break;
		case'volumedown':
			var code = "1017";
			break;
		case'off':
			var code = "1012";
			break;
		case'programmup':
			var code = "1033";
			break;
		case'programmdown':
			var code = "1032";
			break;
		case'mute':
			var code = "1013";
			break;
		case'source':
			var code = "1056";
			break;
		default:
			console.log("Nicht gespeicherter Code für den Befehl: " + command);
			break;
	}
	addQueue(code);
}

function addQueue(code){
	queue.push(code);
	runQueue();
};

function runQueue(){
	if (busy){return;}
	var code = queue.shift();
	if (!code){
		return;
	}
	busy = true;

	var client = new net.Socket();
	client.connect(4660, telefunken.ip, function() {
		var status = client.write(code);
		if(status == true){
			client.destroy();
		}else{
			while(status){
				status = client.write(code);
			}
			client.destroy();
		}
		// console.log(status);
	});
	client.on('data', function(data) {
		// wird hier jemals was ankommen?
		console.log('Received: ' + data);
		client.destroy(); // kill client after server's response
	});
	client.on('close', function() {
		console.log('Connection closed');
	});
	client.on('error', function(err) {
		console.log(err)
	});

	busy = false;
	runQueue();
};