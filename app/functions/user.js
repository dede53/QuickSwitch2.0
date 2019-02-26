var db 				= require('./database.js');
var async 			= require("async");
var deviceFunctions	= require('./device.js');

module.exports = {
	/*****************************************
	* Liefert alle User als Callback
	*****************************************/
	getUsers: function (callback){
		var query = "SELECT * FROM user;";
		db.all(query, function(err, row){
			if(err){
				log.error(err);
			}else{
				var users = [];
				row.forEach(function(user){
					try{
						user.favoritDevices = JSON.parse(user.favoritDevices);
						user.favoritVariables = JSON.parse(user.favoritVariables);
						user.varChart = JSON.parse(user.varChart);
					}catch(e){
						log.error('Falsches Datenformat bei dem Benutzer: ' + user.name);
						user.favoritDevices = [];
						user.favoritVariables = [];
						user.varChart = [];
					}
					users.push(user);
				});
				callback(users);
			}
		});
	},
	/*****************************************
	* liefert einen User als Callback
	* Argument: userID
	*****************************************/
	getUser: function (id, callback){
		var id = parseInt(id) || 1;
		var query = "SELECT * FROM user WHERE id = " + id + ";";
		db.all(query , function(err, row) {
			if (err) {
				log.error(err);
			}else if(row == ""){
				callback("Kein Benutzer mit der ID " + id);
				log.error("Kein Benutzer mit der ID " + id);
			}else{
				try{
					row[0].favoritDevices = JSON.parse(row[0].favoritDevices);
					row[0].favoritVariables = JSON.parse(row[0].favoritVariables);
					row[0].varChart = JSON.parse(row[0].varChart);
				}catch(e){
					log.error('Falsches Datenformat bei dem Benutzer: ' + row[0].name);
					row[0].favoritDevices = [];
					row[0].favoritVariables = [];
					row[0].varChart = [];
				}
				callback(row[0]);
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
	deleteUser: function (id, callback) {
		var query = "SELECT * FROM user WHERE id = " + id + ";";
		db.all(query , function(err, row) {
			if (err) {
				log.error(err);
				callback('Error: ' + err);
			}else if (row == "") {
				callback("300");
				log.error("Kein User mit der ID");
			} else {
				var query = "DELETE FROM user WHERE id = "+ id +";";
				db.all(query ,function(err,rows){
					if(err){
						log.error(err);
						callback('Error: ' + err);
					}else{
						log.info('Delete User with id: ' + id);
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
	saveNewUser: function (data, callback) {
		var query = "INSERT INTO user ( name, favoritDevices, favoritVariables, varChart, chartHour, admin ) VALUES ('"+ data.name +"', '"+ JSON.stringify(data.favoritDevices) +"', '"+ JSON.stringify(data.favoritVariables) +"', '"+ JSON.stringify(data.varChart) +"', '"+ data.chartHour +"', '"+ data.admin +"');";
		db.run(query);
		callback(201);
	},
	/*****************************************
	* ändert einen schon vorhandenen User
	*****************************************/
	saveEditUser: function (data, callback) {
		var query = "UPDATE user SET name = '"+ data.name +"', favoritDevices = '"+ JSON.stringify(data.favoritDevices) +"', favoritVariables = '"+ JSON.stringify(data.favoritVariables) +"', varChart = '"+ JSON.stringify(data.varChart) +"', chartHour = '"+ data.chartHour +"', admin = '"+ data.admin +"' WHERE id = '"+ data.id +"';";
		db.run(query);
		callback(201);
	},
	saveUser: function(data, callback){
		console.log(data);
		if(data.id){
			var query = "UPDATE user SET name = '"+ data.name +"', favoritDevices = '"+ JSON.stringify(data.favoritDevices) +"', favoritVariables = '"+ JSON.stringify(data.favoritVariables) +"', varChart = '"+ JSON.stringify(data.varChart) +"', chartHour = '"+ data.chartHour +"', admin = '"+ data.admin +"' WHERE id = '"+ data.id +"';";
		}else{
			var query = "INSERT INTO user ( name, favoritDevices, favoritVariables, varChart, chartHour, admin ) VALUES ('"+ data.name +"', '"+ JSON.stringify(data.favoritDevices) +"', '"+ JSON.stringify(data.favoritVariables) +"', '"+ JSON.stringify(data.varChart) +"', '"+ data.chartHour +"', '"+ data.admin +"');";
		}
		db.run(query);
		callback(201);
	}
}