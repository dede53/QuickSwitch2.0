var helper = require('../functions/helper.js');

module.exports = function(app, db){
	var userFunctions = require('../functions/user.js');
	/*****************************************
	Socket.io routes für Benutzerbearbeitung
	*****************************************/
	app.io.route('users',function(req, res){
		userFunctions.getUsers(req,res,function(user){
			// data.forEach(function(user){
				req.io.emit('user', user);
			// });
		});
	});

	app.io.route('user', function(req, res){
		var id = req.data.id;
		userFunctions.getUser(id, req, res, function(data){
			req.io.emit('user', data);
		});
	});
	app.io.route('saveUser', function(req, res){
		if( !req.data.id){
			var data = {
				"name": req.data.name,
				"favoritDevices": req.data.favoritDevices,
				"variables": req.data.variables
			};
			userFunctions.saveNewUser(data, req, res, function(response){
				req.io.emit('savedUser', response);
				userFunctions.getUsers(req, res, function(user){
					app.io.broadcast('newuser', user);
				});
			});
		}else{
			var data = 
				{
					"id": req.data.id,
					"name": req.data.name,
					"favoritDevices": req.data.favoritDevices,
					"variables": req.data.variables
				};
			userFunctions.saveEditUser(data, req, res, function(response){
				userFunctions.getUsers(req, res, function(user){
					app.io.broadcast('user', user);
				});
			});
		}
	});
	app.io.route('deleteUser', function(req, res){
		var id = req.data.id;
		userFunctions.deleteUser(id, req, res, function(data){
			// req.io.emit('deletedUser', data);
			userFunctions.getUsers(req, res, function(data){
				app.io.broadcast('newusers', data);
			});
		});
	});
}