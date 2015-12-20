var db 				= require('./database.js');
var async 			= require("async");

module.exports = {
	/*****************************************
	* Liefert alle User als Callback
	*****************************************/
	getUsers: function (req, res, callback){
		var query = "SELECT * FROM user;";
		db.all(query, function(err, row){
			if(err){
				console.log(err);
			}else{
				callback(row);
			}
		});
	},
	/*****************************************
	* liefert einen User als Callback
	* Argument: userID
	*****************************************/
	getUser: function (id, req, res, callback){
		var query = "SELECT * FROM user WHERE id = " + id + ";";
		db.all(query , function(err, row) {
			if (err) {
				console.log(err);
				callback(404);
			}else if(row == ""){
				callback("Kein Benutzer mit der ID" + id);
				console.log("Kein Benutzer mit der ID" + id);
			}else{
				callback(row);
			}
		});
	},
	/*****************************************
	* löscht einen User
	* Callback: Error
				200 bei Erfolg
				300 bei nicht vorhandenem User
	* Argument: userID
	*****************************************/
	deleteUser: function (id, req, res, callback) {
		var query = "SELECT * FROM user WHERE id = " + id + ";";
		db.all(query , function(err, row) {
			if (err) {
				console.log('Error: ' + err);
				callback('Error: ' + err);
			}else if (row == "") {
				callback("300");
				console.log("Kein User mit der ID");
			} else {
				var query = "DELETE FROM user WHERE id = "+ id +";";
				db.all(query ,function(err,rows){
					if(err){
						console.log('Error: ' + err);
						callback('Error: ' + err);
					}else{
						console.log('Delete User with id: ' + id);
						callback("200");
					}
				});
			}
		});
	},
	/*****************************************
	* speichert einen neuen User
	* Callback: 201
	*****************************************/
	saveNewUser: function (data, req, res, callback) {
		var query = "INSERT INTO user ( name, favoritDevices ) VALUES ('"+ data.name +"', '["+ data.favoritDevices +"]');";
		db.run(query);
		callback(201);
	},
	/*****************************************
	* ändert einen schon vorhandenen User
	*****************************************/
	saveEditUser: function (data, req, res, callback) {
		var query = "UPDATE user SET name = '"+ data.name +"', favoritDevices = '["+ data.favoritDevices +"]' WHERE id = '"+ data.id +"';";
		console.log(query);
		db.run(query);
		callback(201);
	}
}