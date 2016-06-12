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
		roomFunctions.getRooms("object", req, res, function(data){
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
				roomFunctions.getRooms("Array", req, res, function(data){
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
				roomFunctions.getRooms("Array", req, res, function(data){
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
			roomFunctions.getRooms("Array", req, res, function(data){
				app.io.broadcast('rooms', data);
			});
		});
	});
	app.io.route('switchRoom', function(req, res){
		var room = req.data.room;
		var status = req.data.status;
		roomFunctions.switchRoom(room, status, app, req, res, function(err){
			if(err != 200){
				helper.log.error("Raum konnte nicht geschaltet werden");
			}
		});
	});
}