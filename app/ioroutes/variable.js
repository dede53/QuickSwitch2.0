var helper = require('../functions/helper.js');

module.exports = function(app, db){
	var variableFunctions = require('../functions/variable.js');

	app.io.route('variables', function(req, res){
		variableFunctions.getVariables(function(data){
			req.io.emit('variable', data);
		});
	});
	/*****************************************
	* schickt die Informationen zu einer Variablen an den Clienten
	*****************************************/
	app.io.route('variable', function(req, res){
		var id = req.data.id;
		variableFunctions.getVariable(id, function(data){
			req.io.emit('variable', data);
		});
	});

	app.io.route('getStoredVariables', function(req, res){
		console.log(req.data);
		req.data.hour = 24;
		variableFunctions.getStoredVariables(req.data, function(data){
			console.log("SENDE DATEN!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
			req.io.emit('storedVariables', data);
		});
	});
	/*****************************************
	* Speichert den Wert der vom Clienten geliefert wurde
	*****************************************/
	/*
	app.io.route('saveVariable', function(req, res){
		if( !req.data.id){
			var data = {
				"name": req.data.name,
				"status": req.data.status,
				"error": req.data.error
			};
			variableFunctions.saveNewVariable(data, req, res, function(data){
				variableFunctions.getVariables(req, res, function(data){
					data.forEach(function(variable){
						app.io.broadcast('variable', variable);
					});
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
					data.forEach(function(variable){
						app.io.broadcast('variable', variable);
					});
				});
			});
		}
	});
*/
	app.io.route('saveVariable', function(req, res){
		variableFunctions.saveNewVariable(req.data, function(){
			variableFunctions.getVariables(function(data){
				app.io.broadcast('variable', variable);
			});
		});
	});
	/*****************************************
	* Löscht die Variable dessen ID vom Clienten kommt
	*****************************************/
	app.io.route('deleteVariable', function(req, res){
		var name = req.data.name;
		helper.log.info('Delete Variable: ' + name);
		variableFunctions.deleteVariable(name, function(data){
			variableFunctions.getVariables(function(data){
				app.io.broadcast('variable', variable);
			});
		});
	});
}