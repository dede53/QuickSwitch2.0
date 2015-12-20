var helper = require('../functions/helper.js');

module.exports = function(app, db){
	var groupFunctions = require('../functions/group.js');
	/*****************************************
	* Socket.io routes für Gruppen
	*
	*
	*
	* Liefert alle Gruppen mit Name, ID...
	*****************************************/
	app.io.route('groups', function(req, res){
		groupFunctions.getGroups(req, res, function(data){
			req.io.emit('groups', data);
		});
	});
	/*****************************************
	* schickt die Informationen zu einer Gruppe an den Clienten
	*****************************************/
	app.io.route('group', function(req, res){
		var id = req.data.id;
		groupFunctions.getGroup(id, req, res, function(data){
			req.io.emit('group', data);
		});
	});
	/*****************************************
	* Speichert die Gruppe der vom Clienten geliefert wurde
	*****************************************/
	app.io.route('saveGroup', function(req, res){
		if( !req.data.id){
			var data = {
				"name": req.data.name,
				"devices": req.data.groupDevices
			};
			groupFunctions.saveNewGroup(data, req, res, function(data){
				req.io.emit('savedGroup', data);
				groupFunctions.getGroups(req, res, function(data){
					app.io.broadcast('groups', data);
				});
			});
		}else{
			var data = 
				{
					"id": req.data.id,
					"name": req.data.name,
					"devices": req.data.groupDevices
				};
			groupFunctions.saveEditGroup(data, req, res, function(data){
				req.io.emit('savedGroup', data);
				groupFunctions.getGroups(req, res, function(data){
					app.io.broadcast('groups', data);
				});
			});
		}
	});
	/*****************************************
	* Löscht die Gruppe dessen ID vom Clienten kommt
	*****************************************/
	app.io.route('deleteGroup', function(req, res){
		var id = req.data.id;
		groupFunctions.deleteGroup(id, req, res, function(data){
			req.io.emit('deletedGroup', data);
			groupFunctions.getGroups(req, res, function(data){
				app.io.broadcast('groups', data);
			});
		});
	});

	/*****************************************
	* schaltet Gruppen
	*****************************************/
	app.io.route('switchGroup', function(req, res){
		var group = req.data.group;
		var status = req.data.status;
		groupFunctions.switchGroup(app, group, status, req, res, function(err){
			if(err != 200){
				console.log("Gruppe konnte nicht geschaltet werden");
			}
		});
	});
}