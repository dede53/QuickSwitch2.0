var userFunctions			=	require('./user.js');

var alerts = function(alert){
	this.id = alert.id;
	this.title = alert.title;
	this.message = alert.message;
	this.user = alert.user;
	this.messageType = alert.messageType;
	this.date = new Date().getTime();
	this.active = false;
}
alerts.prototype.show = function(app){
	this.active = true;
	app.io.in(this.user).emit('change', new message("alerts:add", this));
}

alerts.prototype.remove = function(app, callback){
	app.io.in(this.user).emit('change', new message('alerts:remove', this.id));
	callback();
}

// alerts.prototype.add = function(title, message, user, type, app){
// 	return new alerts(title, message, user, type, app);
// }

// alerts.prototype.addAll = function(title, message, type, callback){
// 	userFunctions.getUsers(function(users){
// 		users.forEach(function(user){
// 			console.log(user.name);
// 			callback(
// 				new alerts(title, message, user.name, type, Math.floor((Math.random() * 100) + 1) )
// 			);
// 		});
// 	});
// }

module.exports = alerts;


function message(type, data){
	var message = {};
	var foo = type.split(':');
	message.masterType = foo[0];
	message.type = foo[1];
	message[foo[1]] = data;
	return message;
}