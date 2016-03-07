var helper = require('../functions/helper.js');

module.exports = function(app, db){
	var variableFunctions = require('../functions/variable.js');

	app.io.route('variables', function(req, res){
		variableFunctions.getVariables( req, res, function(data){
			req.io.emit('variables', data);
		});
	});
	/*****************************************
	* schickt die Informationen zu einem Raum an den Clienten
	*****************************************/
	app.io.route('variable', function(req, res){
		var id = req.data.id;
		variableFunctions.getVariable(id, req, res, function(data){
			req.io.emit('variable', data);
		});
	});
	/*****************************************
	* Speichert den Raum der vom CLienten geliefert wurde
	*****************************************/
	app.io.route('saveVariable', function(req, res){
		if( !req.data.id){
			var data = {
				"name": req.data.name,
				"status": req.data.status,
				"error": req.data.error
			};
			variableFunctions.saveNewVariable(data, req, res, function(data){
				variableFunctions.getVariables(req, res, function(data){
					app.io.broadcast('variables', data);
				});
			});
		}else{
			var data = 
				{
					"id": req.data.id,
					"name": req.data.name,
					"status": req.data.status,
					"error": req.data.error
				};
			variableFunctions.saveEditVariable(data, req, res, function(data){
				variableFunctions.getVariables(req, res, function(data){
					app.io.broadcast('variables', data);
				});
			});
		}
	});
	/*****************************************
	* Löscht den Raum dessen ID vom Clienten kommt
	*****************************************/
	app.io.route('deleteVariable', function(req, res){
		var id = req.data.id;
		variableFunctions.deleteVariable(id, req, res, function(data){
			variableFunctions.getVariables(req, res, function(data){
				app.io.broadcast('variables', data);
			});
		});
	});
}