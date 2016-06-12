var db 				= require('./database.js');
var async 			= require("async");
var helper 			= require('./helper.js');

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
				helper.log.error(err);
				callback(404);
			}else{
				callback(messages);
			}
		});
	},
	loadOldMessages: function (data, callback){
		var query = "SELECT time, type, author, message FROM messages WHERE time < '" + data + "' ORDER BY time DESC LIMIT 6;";
		db.all(query, function(err, messages){
			if (err) {
				helper.log.error(err);
			}else{
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
	}
}