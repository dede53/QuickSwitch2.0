var db 				= require('./database.js');
var async 			= require("async");
var helper 			= require('./helper.js');

module.exports = {
	saveMessage: function (data, callback){
		var query = "INSERT INTO messages (time, type, author, message) VALUES ('"+ data.time +"','"+ data.type +"','"+ data.author +"','"+ data.message +"');";
<<<<<<< HEAD
		db.all(query, function(err, req){
			if(err){
				callback(err, undefined);
			}else{
				data.id = req.insertId;
				callback(200, data);
=======
		db.all(query, function(err, data){
			if(err){
				callback(err);
			}else{
				callback("200");
>>>>>>> d3e70a1d720f830c1b7fd87dccb9dd8e639e7874
			}
		});
	},
	sendMessages: function (callback){
		var query = "SELECT time, type, author, message FROM messages WHERE time >= ( " + data + " - 86400 ) AND time <=  UNIX_TIMESTAMP(NOW()) * 1000;";
		db.all(query , function(err, messages) {
			if (err) {
				helper.log.error(err);
<<<<<<< HEAD
				callback(404, undefined);
			}else{
				callback(200, messages);
=======
				callback(404);
			}else{
				callback(messages);
>>>>>>> d3e70a1d720f830c1b7fd87dccb9dd8e639e7874
			}
		});
	},
	loadOldMessages: function (data, callback){
<<<<<<< HEAD
		var query = "SELECT id, time, type, author, message FROM messages WHERE time < '" + data + "' ORDER BY time DESC LIMIT 10;";
=======
		var query = "SELECT time, type, author, message FROM messages WHERE time < '" + data + "' ORDER BY time DESC LIMIT 6;";
>>>>>>> d3e70a1d720f830c1b7fd87dccb9dd8e639e7874
		db.all(query, function(err, messages){
			if (err) {
				helper.log.error(err);
			}else{
				var messagesToSend = new Object;
<<<<<<< HEAD
				messagesToSend.messages = new Object;
				messages.forEach(function(message){
					messagesToSend.messages[message.id] = message;
				});
=======
				messagesToSend.messages = messages;

>>>>>>> d3e70a1d720f830c1b7fd87dccb9dd8e639e7874
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