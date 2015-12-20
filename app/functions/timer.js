var db 				= require('./database.js');

module.exports = {
	getTimers: function(req, res, callback){
		var query = "SELECT id, name, conditions, actions FROM timer;";
		console.log(query);
		db.all(query, function(err, data){
			if(err){
				callback(404);
				console.log(err);
			}else{
				console.log(data);
				
				for(var i = 0; i< data.length; i++){
					data[i].conditions = JSON.parse(data[i].conditions);
					data[i].actions = JSON.parse(data[i].actions);
				}
				callback(data);
			}
		});
	},
	getTimer: function(id, req, res, callback){
		var query = "SELECT id, name, conditions, actions FROM timer WHERE id = " + id + ";";
		db.all(query, function(err, data){
			if(err){
				console.log(err);
				callback(404);
			}else if(data == ""){
				console.log("Keinen Timer mit der ID: " + id);
				callback(404);
			}else{
				callback(data);
			}
		});
	},
	saveNewTimer: function(data, req, res, callback){
		var query = "INSERT INTO groups (name, conditions, actions) VALUES ('" + data.name + "', '" + data.conditions + "', '" + data.actions + "');";
		db.run(query);
		callback(201);
	},
	saveEditTimer: function(data, req ,res, callback){
		console.log(data);
		var query = "UPDATE timer SET name = '" + data.name + "', conditions = '" + data.conditions + "', actions = '" + data.actions + "' WHERE id = '" + data.id + "';";
		db.run(query);
		callback(201);
	},
	deleteTimer: function(id, req, res, callback){
		var query = "DELETE FROM timer WHERE id = '" + id + "';";
		db.all(query, function(err, data){
			if(err){
				callback(err);
			}else{
				callback("200");
			}
		});
	}
}