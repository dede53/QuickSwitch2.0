var express 		= require('express.oi');
var app 			= express().http().io();
var server;
var connections = {};
var socketID = 0;

app.get('/', function(req, res){
	res.send(200);
	// console.log(connections);
	// console.log(server);
	server.close();
	var ids = Object.keys(connections);
	// console.log(connections);
	ids.forEach(function(id){
		connections[id].destroy();
		// console.log(connections);
	});
});

server = app.listen(1234, function(){
	console.log("gestartet");

	// console.log(server);
	// server = app.listen(1234, function(){
		// console.log(server);
		// server.close();
	// });
});


server.on('connection', function(socket){
	connections[socketID++] = socket;
});

// var express 		= require('express.oi');
// var app 			= express().http().io();
// var server			= {};
// var standardPort 	= 1234;

// function start(port, callback){
// 	var port = port || getFreePort();
// 	try{
// 		server[port] = app.listen(port, function(){
// 			console.log("Erfolgreich gestartet!", port);
// 			if(callback){
// 				callback(200);
// 			}
// 		});
// 	}catch(e){
// 		if(callback){
// 			callback(404);
// 		}
// 		console.log(e);
// 	}
// }

// function stop(port, callback){
// 	try{
// 		server[port].close();
// 		delete server[port];
// 		console.log("Der server wurde gestoppt!", port);
// 		if(callback){
// 			callback(200);
// 		}
// 	}catch(e){
// 		console.log("Fehler: Der Server konnte nicht gestoppt werden!");
// 		console.log(e);
// 		if (callback){
// 			callback(404);
// 		}
// 	}
// }

// start();
// start();
// start();

// setTimeout(function(){
// 	var ports = Object.keys(server);
// 	ports.forEach(function(port){
// 		stop(port, function(status){
// 			start();
// 		});
// 	});
// }, 1000);


// function getFreePort() {
// 	var ports = Object.keys(server);
// 	if(ports.length == 0){
// 		server[standardPort] = {};
// 		return standardPort;
// 	}else{
// 		var i = 0;
// 		var port = standardPort;
		
// 		while(ports.indexOf((standardPort + i).toString()) != -1 ){
// 			i++;
// 		}
// 		port = standardPort + i;
// 		server[port] = {};
// 		return port;
// 	}
// }