var db 				= require('./database.js');
var async 			= require("async");
var helper 			= require('./helper.js');
var deviceFunctions	= require('./device.js');
var variableFunctions		= require('./variable.js');

module.exports = {
	/*****************************************
	* Liefert alle User als Callback
	*****************************************/
	getUsers: function (req, res, callback){
		var query = "SELECT * FROM user;";
		db.all(query, function(err, row){
			if(err){
				helper.log.error(err);
			}else{
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
					deviceFunctions.favoritDevices(user, req, res, function(devices){
						user.favoritDevices = devices;
						callback(user);
					});
				});
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
	deleteUser: function (id, req, res, callback) {
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
	saveNewUser: function (data, req, res, callback) {
		var query = "INSERT INTO user ( name, favoritDevices ) VALUES ('"+ data.name +"', '["+ data.favoritDevices +"]');";
		db.run(query);
		callback(201);
	},
	/*****************************************
	* ändert einen schon vorhandenen User
	*****************************************/
	saveEditUser: function (data, req, res, callback) {
		console.log(data);
		var query = "UPDATE user SET name = '"+ data.name +"', favoritDevices = '["+ data.favoritDevices +"]', variables = '["+ data.variables +"]' WHERE id = '"+ data.id +"';";
		db.run(query);
		callback(201);
	}
}