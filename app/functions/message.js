var db 				= require('./database.js');
var async 			= require("async");

module.exports = {
	saveMessage: function (data, callback){
		var query = "INSERT INTO messages (time, type, author, message) VALUES ('"+ data.time +"','"+ data.type +"','"+ data.author +"','"+ data.message +"');";
		db.all(query, function(err, data){
			if(err){
				callback(err);
			}else{
				callback("200");
			}
		});
	},
	sendMessages: function (callback){
		var query = "SELECT time, type, author, message FROM messages WHERE time >= ( " + data + " - 86400 ) AND time <=  UNIX_TIMESTAMP(NOW()) * 1000;";
		db.all(query , function(err, messages) {
			if (err) {
				console.log(err);
				callback(404);
			}else{
				callback(messages);
			}
		});
	},
	loadOldMessages: function (data, callback){
				var query = "SELECT time, type, author, message FROM messages WHERE time < '" + data + "' ORDER BY time DESC LIMIT 1;";
				db.all(query, function(err, messages){
					if (err) {
						console.log(err);
					}else{
						console.log(messages);
						var messagesToSend = new Object;
						messagesToSend.messages = messages;

						if(messages == ""){
							messagesToSend.moreMessagesAvible = false;
						}else{
							messagesToSend.moreMessagesAvible = true;
						}
						callback(messagesToSend);
					}
				});
				/*
		var query = "SELECT * FROM messages LIMIT 1;";
		db.all(query , function(err, latest) {
			if (err || latest == "") {
				console.log("Fehler beim auslesen der letzten Nachricht, oder keine Nachricht in der Datenbank");
				console.log(latest);
				console.log(err);
			}else{
				// var query = "SELECT time, type, author, message FROM messages WHERE time < "+ data +" AND time >= ( " + data + " - 86400000 ) ORDER BY time DESC;";
				var query = "SELECT time, type, author, message FROM messages WHERE time < "+ data +" ORDER BY time DESC LIMIT 1 ";
				//console.log(query);
				db.all(query , function(err, messages) {
					if (err) {
						console.log(err);
					}else{
						var messagesToSend = new Object;
						messagesToSend.messages = messages;
						messagesToSend.timestamp = data;

						if(data <= latest[0].time){
							messagesToSend.moreMessagesAvible = false;
						}else{
							messagesToSend.moreMessagesAvible = true;
						}
						callback(messagesToSend);
					}
				});
			}
		});*/
	}
}