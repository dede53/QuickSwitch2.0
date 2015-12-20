<<<<<<< HEAD
var helper = require('../functions/helper.js');


module.exports = function(app, db){
	var messageFunctions = require('../functions/message.js');
	/*****************************************
	* Socket.io routes für Chatnachrichten
	*
	*
	*
	* speichert eine neue Nachricht und sendet sie an alle Teilnehmer
	*****************************************/
	app.io.route('newLinkMessage', function(req){
		req.data.time = Math.floor(Date.parse(new Date));
		app.io.broadcast('newLinkMessage', req.data);
		messageFunctions.saveMessage(req.data, function(data){
			if(data != "200"){
				log("Nachricht konnte nicht gespeichert werden!", "error");
				log( data , "error");
			}
		});
	});
	/*****************************************
	* lädt ältere Nachrichten aus der Datenbank und schickt sie an den Clienten
	*****************************************/
	app.io.route('loadOldMessages', function(req){
		messageFunctions.loadOldMessages(req.data, function(data){
			req.io.emit('linkMessage', data);
		});
	});
=======
var helper = require('../functions/helper.js');


module.exports = function(app, db){
	var messageFunctions = require('../functions/message.js');
	/*****************************************
	* Socket.io routes für Chatnachrichten
	*
	*
	*
	* speichert eine neue Nachricht und sendet sie an alle Teilnehmer
	*****************************************/
	app.io.route('newLinkMessage', function(req){
		req.data.time = Math.floor(Date.parse(new Date));
		console.log(req.data);
		app.io.broadcast('newLinkMessage', req.data);
		messageFunctions.saveMessage(req.data, function(data){
			if(data != "200"){
				log("Nachricht konnte nicht gespeichert werden!", "error");
				log( data , "error");
			}
		});
	});
	/*****************************************
	* lädt ältere Nachrichten aus der Datenbank und schickt sie an den Clienten
	*****************************************/
	app.io.route('loadOldMessages', function(req){
		messageFunctions.loadOldMessages(req.data, function(data){
			console.log("Daten Abfragen!!!!");
			req.io.emit('1234', data);
		});
	});
>>>>>>> af97e501eae31491992417dd0f792413c9d64b8f
}