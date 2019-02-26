var events					=	require('events');
var userFunctions			=	require('./user.js');

var allAlerts = function(){
	this.alerts =  {};
};
allAlerts.prototype = new events.EventEmitter();
allAlerts.prototype.add = function(alert){
	alert.id = Math.floor((Math.random() * 100) + 1);
	if(!this.alerts[alert.user]){
		this.alerts[alert.user] = {};
	}
	this.alerts[alert.user][alert.id] = new createAlerts(alert);
	this.emit("add", this.alerts[alert.user][alert.id]);
}
allAlerts.prototype.remove = function(alert){
	if(this.alerts[alert.user] && this.alerts[alert.user][alert.id]){
		delete this.alerts[alert.user][alert.id];
	}
	this.emit("remove", alert);
}
allAlerts.prototype.removeAll = function(user){
	for(var id in this.alerts[user]){
		this.remove(this.alerts[user][id])
	}
}
allAlerts.prototype.addAll = function(alert){
	userFunctions.getUsers((users) => {
		users.forEach((user) => {
			if(alert.toAdmin){
				if(user.admin == true || user.admin == "true"){
					alert.user = user.name;
					this.add(alert);
				}
			}else{
				alert.user = user.name;
				this.add(alert);
			}
		});
	});
}

module.exports = allAlerts;

function createAlerts(alert){
	this.id = alert.id;
	this.title = alert.title;
	this.message = alert.message;
	this.user = alert.user;
	this.messageType = alert.messageType;
	this.date = new Date().getTime();
	this.active = false;
}