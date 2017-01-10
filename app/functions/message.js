var db 				= require('./database.js');
var async 			= require("async");
var helper 			= require('./helper.js');

module.exports = {
	saveMessage: function (data, callback){
		var query = "INSERT INTO messages (time, type, author, message) VALUES ('"+ data.time +"','"+ data.type +"','"+ data.author +"','"+ data.message +"');";
		db.all(query, function(err, req){
			if(err){
				callback(err, undefined);
			}else{
				data.id = req.insertId;
				callback(200, data);
			}
		});
	},
	sendMessages: function (callback){
		var query = "SELECT time, type, author, message FROM messages WHERE time >= ( " + data + " - 86400 ) AND time <=  UNIX_TIMESTAMP(NOW()) * 1000;";
		db.all(query , function(err, messages) {
			if (err) {
				helper.log.error(err);
				callback(404, undefined);
			}else{
				callback(200, messages);
			}
		});
	},
	loadOldMessages: function (data, callback){
		var query = "SELECT id, time, type, author, message FROM messages WHERE time < '" + data + "' ORDER BY time DESC LIMIT 10;";
		db.all(query, function(err, messages){
			if (err) {
				helper.log.error(err);
			}else{
				var messagesToSend = new Object;
				messagesToSend.messages = new Object;
				// messages.forEach(function(message){
				// 	messagesToSend.messages[message.id] = message;
				// });
				messagesToSend.messages = messages;
				if(messages == ""){
					messagesToSend.moreMessagesAvailable = false;
				}else{
					messagesToSend.moreMessagesAvailable = true;
				}
				callback(messagesToSend);
			}
		});
	}
}