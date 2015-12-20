<<<<<<< HEAD
var helper = require('../functions/helper.js');

module.exports = function(app, db){
	var roomFunctions = require('../functions/room.js');
	/*****************************************
	* Socket.io routes für Raumdaten
	*
	*
	*
	*
	* Liefert alle Räume mit Name, ID...
	*****************************************/
	app.io.route('rooms', function(req, res){
		roomFunctions.getRooms(req, res, function(data){
			req.io.emit('rooms', data);
		});
	});
	/*****************************************
	* schickt die Informationen zu einem Raum an den Clienten
	*****************************************/
	app.io.route('room', function(req, res){
		var id = req.data.id;
		roomFunctions.getRoom(id, req, res, function(data){
			req.io.emit('room', data);
		});
	});
	/*****************************************
	* Speichert den Raum der vom CLienten geliefert wurde
	*****************************************/
	app.io.route('saveRoom', function(req, res){
		if( !req.data.id){
			var data = {
				"name": req.data.name
			};
			roomFunctions.saveNewRoom(data, req, res, function(data){
				req.io.emit('savedRoom', data);
				roomFunctions.getRooms(req, res, function(data){
					app.io.broadcast('rooms', data);
				});
			});
		}else{
			var data = 
				{
					"id": req.data.id,
					"name": req.data.name
				};
			roomFunctions.saveEditRoom(data, req, res, function(data){
				roomFunctions.getRooms(req, res, function(data){
					app.io.broadcast('rooms', data);
				});
			});
		}
	});
	/*****************************************
	* Löscht den Raum dessen ID vom Clienten kommt
	*****************************************/
	app.io.route('deleteRoom', function(req, res){
		var id = req.data.id;
		roomFunctions.deleteRoom(id, req, res, function(data){
			req.io.emit('deletedRoom', data);
			roomFunctions.getRooms(req, res, function(data){
				app.io.broadcast('rooms', data);
			});
		});
	});
	app.io.route('switchRoom', function(req, res){
		var id = req.data.id;
		var status = req.data.status;
		roomFunctions.switchRoom(app, id, status, req, res, function(err){
			if(err != 200){
				console.log("Raum konnte nicht geschaltet werden");
			}
		});
	});
=======
var helper = require('../functions/helper.js');

module.exports = function(app, db){
	var roomFunctions = require('../functions/room.js');
	/*****************************************
	* Socket.io routes für Raumdaten
	*
	*
	*
	*
	* Liefert alle Räume mit Name, ID...
	*****************************************/
	app.io.route('rooms', function(req, res){
		roomFunctions.getRooms(req, res, function(data){
			req.io.emit('rooms', data);
		});
	});
	/*****************************************
	* schickt die Informationen zu einem Raum an den Clienten
	*****************************************/
	app.io.route('room', function(req, res){
		var id = req.data.id;
		roomFunctions.getRoom(id, req, res, function(data){
			req.io.emit('room', data);
		});
	});
	/*****************************************
	* Speichert den Raum der vom CLienten geliefert wurde
	*****************************************/
	app.io.route('saveRoom', function(req, res){
		if( !req.data.id){
			var data = {
				"name": req.data.name
			};
			roomFunctions.saveNewRoom(data, req, res, function(data){
				req.io.emit('savedRoom', data);
				roomFunctions.getRooms(req, res, function(data){
					app.io.broadcast('rooms', data);
				});
			});
		}else{
			var data = 
				{
					"id": req.data.id,
					"name": req.data.name
				};
			roomFunctions.saveEditRoom(data, req, res, function(data){
				roomFunctions.getRooms(req, res, function(data){
					app.io.broadcast('rooms', data);
				});
			});
		}
	});
	/*****************************************
	* Löscht den Raum dessen ID vom Clienten kommt
	*****************************************/
	app.io.route('deleteRoom', function(req, res){
		var id = req.data.id;
		roomFunctions.deleteRoom(id, req, res, function(data){
			req.io.emit('deletedRoom', data);
			roomFunctions.getRooms(req, res, function(data){
				app.io.broadcast('rooms', data);
			});
		});
	});
	app.io.route('switchRoom', function(req, res){
		var room = req.data.room;
		var status = req.data.status;
		roomFunctions.switchRoom(room, status, req, res, function(err){
			if(err != 200){
				console.log("Raum konnte nicht geschaltet werden");
			}
		});
	});
>>>>>>> af97e501eae31491992417dd0f792413c9d64b8f
}