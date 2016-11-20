var db 				= require('./database.js');
var async 			= require("async");
var helper 			= require('./helper.js');
var deviceFunctions	= require('./device.js');
var variableFunctions		= require('./variable.js');

module.exports = {
	/*****************************************
	* Liefert alle User als Callback
	*****************************************/
<<<<<<< HEAD
	getUsers: function (callback){
=======
	getUsers: function (req, res, callback){
>>>>>>> d3e70a1d720f830c1b7fd87dccb9dd8e639e7874
		var query = "SELECT * FROM user;";
		db.all(query, function(err, row){
			if(err){
				helper.log.error(err);
			}else{
<<<<<<< HEAD
				var users = [];
=======
>>>>>>> d3e70a1d720f830c1b7fd87dccb9dd8e639e7874
				row.forEach(function(user){

					try{
						user.favoritDevices = JSON.parse(user.favoritDevices);
						user.variables = JSON.parse(user.variables);
						user.varChart = JSON.parse(user.varChart);
					}catch(e){
						helper.log.error('Falsches Datenformat bei dem Benutzer: ' + user.name);
						user.favoritDevices = [];
						user.variables = [];
						user.varChart = [];
					}
<<<<<<< HEAD
					users.push(user);
				});
				callback(users);
=======
					deviceFunctions.favoritDevices(user, req, res, function(devices){
						user.favoritDevices = devices;
						callback(user);
					});
				});
>>>>>>> d3e70a1d720f830c1b7fd87dccb9dd8e639e7874
			}
		});
	},
	/*****************************************
	* liefert einen User als Callback
	* Argument: userID
	*****************************************/
<<<<<<< HEAD
	getUser: function (id, callback){
=======
	getUser: function (id, req, res, callback){
>>>>>>> d3e70a1d720f830c1b7fd87dccb9dd8e639e7874
		var query = "SELECT * FROM user WHERE id = " + id + ";";
		db.all(query , function(err, row) {
			if (err) {
				helper.log.error(err);
			}else if(row == ""){
				callback("Kein Benutzer mit der ID" + id);
				helper.log.error("Kein Benutzer mit der ID" + id);
			}else{
				try{
					row[0].favoritDevices = JSON.parse(row[0].favoritDevices);
					row[0].variables = JSON.parse(row[0].variables);
				}catch(e){
					helper.log.error('Falsches Datenformat bei dem Benutzer: ' + row[0].name);
					row[0].favoritDevices = [];
					row[0].variables = [];
				}
				deviceFunctions.favoritDevices(row[0], req, res, function(devices){
					row[0].favoritDevices = devices;
					callback(row[0]);
				});
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
<<<<<<< HEAD
	deleteUser: function (id, callback) {
=======
	deleteUser: function (id, req, res, callback) {
>>>>>>> d3e70a1d720f830c1b7fd87dccb9dd8e639e7874
		var query = "SELECT * FROM user WHERE id = " + id + ";";
		db.all(query , function(err, row) {
			if (err) {
				helper.log.error(err);
				callback('Error: ' + err);
			}else if (row == "") {
				callback("300");
				helper.log.error("Kein User mit der ID");
			} else {
				var query = "DELETE FROM user WHERE id = "+ id +";";
				db.all(query ,function(err,rows){
					if(err){
						helper.log.error(err);
						callback('Error: ' + err);
					}else{
						helper.log.info('Delete User with id: ' + id);
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
<<<<<<< HEAD
	saveNewUser: function (data, callback) {
=======
	saveNewUser: function (data, req, res, callback) {
>>>>>>> d3e70a1d720f830c1b7fd87dccb9dd8e639e7874
		var query = "INSERT INTO user ( name, favoritDevices ) VALUES ('"+ data.name +"', '["+ data.favoritDevices +"]');";
		db.run(query);
		callback(201);
	},
	/*****************************************
	* ändert einen schon vorhandenen User
	*****************************************/
<<<<<<< HEAD
	saveEditUser: function (data, callback) {
=======
	saveEditUser: function (data, req, res, callback) {
>>>>>>> d3e70a1d720f830c1b7fd87dccb9dd8e639e7874
		console.log(data);
		var query = "UPDATE user SET name = '"+ data.name +"', favoritDevices = '["+ data.favoritDevices +"]', variables = '["+ data.variables +"]' WHERE id = '"+ data.id +"';";
		db.run(query);
		callback(201);
	}
}