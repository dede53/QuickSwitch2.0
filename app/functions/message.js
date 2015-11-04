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
		// var query = "SELECT time(time/1000, 'unixepoch', 'localtime') AS time, type, author, message FROM messages WHERE time >=  (strftime('%s', datetime( 'now','-24 hour'))* 1000) AND time <=  strftime('%s','now') * 1000;";
		var query = "SELECT time, type, author, message FROM messages WHERE time >=  (strftime('%s', datetime( 'now','-24 hour'))* 1000) AND time <=  strftime('%s','now') * 1000;";
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
		var query = "SELECT * FROM messages LIMIT 1;";
		db.all(query , function(err, latest) {
			if (err || latest == "") {
				console.log("Fehler beim auslesen der letzten Nachricht, oder keine Nachricht in der Datenbank");
				console.log(latest);
				console.log(err);
			}else{
				var query = "SELECT time, type, author, message FROM messages WHERE time < "+ data +" AND time >=  (strftime('%s', datetime(("+ data +" /1000), 'unixepoch' ,'-24 hour'))* 1000) ORDER BY time DESC;";
				db.all(query , function(err, messages) {
					if (err) {
						console.log(err);
						// callback(404);
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
						// if(messages == ""){							
							
						// }else{
							
						// }
					}
				});
			}
		});
	}
}