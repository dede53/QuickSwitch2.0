var db 				= require('./database.js');
var SwitchServer	= require('./SwitchServer.js');
var async 			= require("async");

module.exports = {
	getVariables: function(req, res, callback){
		var query = "SELECT id, name, status, error FROM variable;";
		db.all(query, function(err, data){
			if(err){
				callback(404);
				console.log(err);
			}else{
				callback(data);
			}
		});
	},
	getVariable: function(id, req, res, callback){
		var query = "SELECT id, name, status, error FROM variable WHERE id = " + id + ";";
		db.all(query, function(err, data){
			if(err){
				console.log(err);
				callback(404);
			}else if(data == ""){
				console.log("Keine Variabel mit der ID: " + id);
				callback(404);
			}else{
				callback(data);
			}
		});
	},
	saveNewVariable: function(data, req, res, callback){
		var query = "INSERT INTO variable (name) VALUES ('" + data.name + "');";
		db.run(query);
		callback(201);
	},
	saveEditVariable: function(data, req ,res, callback){
		var query = "UPDATE variable SET status = '" + data.status + "', error = '" + data.error + "' WHERE name = '" + data.name + "';";
		db.run(query);
		callback(201);
	},
	deleteVariable: function(id, req, res, callback){
		var query = "DELETE FROM variable WHERE id = '" + id + "';";
		db.all(query, function(err, data){
			if(err){
				callback(err);
			}else{
				callback("200");
			}
		});
	}
}