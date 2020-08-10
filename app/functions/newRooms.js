var db							=	require('./database.js');
var events						=	require('events');

function rooms(){
	this.rooms = {};
	var query = "SELECT * FROM rooms;";
	db.all(query, (err, data) => {
		if(err){
			console.log(err);
			return;
		}
		for(var index in data){
			this.add(data[index]);
		}
	});
}

rooms.prototype.add = function(data) {
	this.rooms[data.id] = new room(data);
};


function room(){
	this.id 			= data.id;
	this.name 			= data.name;
	this.roomdevices	= {};
}