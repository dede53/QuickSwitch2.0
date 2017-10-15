var db							=	require('./database.js');
var events						=	require('events');


var stopSaveVariable = function(){
	if (this.interval != undefined){
		clearInterval(this.interval);
	}
}

var createVariable = function (variable, config){
	this.variable = variable;
	this.dependendTimer = [];
	this.setSaveActive(this.variable.saveActive);
	this.log = {
		"info": function(data){
			if(config.loglevel == 1 ){
				process.send({"log":data});
			}
		},
		"debug": function(data){
			if(config.loglevel <= 2){
				process.send({"log":data});
			}
		},
		"warning": function(data){
			if(config.loglevel <= 3){
				process.send({"log":data});
			}
		},
		"error": function(data){
			if(config.loglevel <= 4){
				process.send({"log":data});
			}
		},
		"pure": function(data){
			process.send({"log":data});
		}
	}
}

createVariable.prototype = new events.EventEmitter();

createVariable.prototype.saveVariable = function(data){
	if(data.uid){
		var query = "UPDATE variable SET "
					+ "name = '" + ( data.name || data.id ) + "', "
					+ "status = '" + ( data.status || false ) + "', "
					+ "charttype = '" + ( data.charttype || 'line' ) + "', "
					+ "linetype = '" + ( data.linetype || 'Solid' ) + "', "
					+ "linecolor = '" + ( data.linecolor || '#ff0' ) + "', "
					+ "error = '" + (data.error || '') + "', "
					+ "lastChange = '" + new Date().getTime() + "', "
					+ "suffix = '" + ( data.suffix || '' ) + "', "
					+ "step = '" + ( data.step || false ) + "', "
					+ "showall = '" + ( data.showall || false ) + "', "
					+ "user = '" + ( data.user  || '' ) + "', "
					+ "saveActive = '" + ( data.saveActive || false ) + "', "
					+ "saveType = '" + ( data.saveType  || 'onChange' )+ "', "
					+ "saveInterval = '" + ( parseInt(data.saveInterval) || 5 ) + "' "
					+ "WHERE id = '" + data.id + "';";
	}else{
		var query = "INSERT INTO variable (id, name, status, charttype, linetype, linecolor, error, lastChange, suffix, step, showall, user, saveActive, saveType, saveInterval) VALUES ('"+data.id+"', '"+(data.name|| data.id)+"', '"+(data.status|| false)+"', '"+(data.charttype|| "line")+"', '"+(data.linetype|| "Solid")+"', '"+(data.linecolor || "#9f4444")+"', '"+(data.error||'')+"', '"+new Date().getTime()+"', '"+(data.suffix|| '')+"', '"+(data.step|| false)+"', '"+(data.showall||false)+"', '"+(data.user||'')+"', '"+(data.saveActive|| false)+"', '"+(data.saveType||"onChange")+"', '" + (data.saveInterval || 5) + "');";
    }
	this.variable = data;
	db.run(query);
	this.setSaveActive(data.saveActive);
}

createVariable.prototype.setVariable = function(status, callback){
	var that = this;
	// Nur wenn auch ein neuer Wert vorliegt!
	if(status != this.variable.status){	
		var toDatabase = function(variable){
			that.log.info("Variable speichern(onchange):" + variable.id, variable.status);
			var now = Math.floor(Date.parse(new Date));
			var query = "INSERT INTO stored_vars (id, time, value) VALUES ('" + variable.id + "', '" + now + "', '" + variable.status + "');";
			db.run(query);
		}
		if(this.variable.saveActive == true || this.variable.saveActive == 'true'){
			if(this.variable.saveType == "onchange" && this.variable.status != status){
				this.variable.status = status;
				toDatabase(this.variable);
			}else{
				this.variable.status = status;
			}
		}else{
			this.variable.status = status;
		}
		for(var id in this.dependendTimer){
			if(callback){
				callback(this.dependendTimer[id], this.variable);
			}
		}
		this.emit('variable', this.variable);
	}
};

createVariable.prototype.setSaveActive = function(status){
	if(status == true || status == 'true'){
		this.variable.saveActive = true;
		if(this.variable.saveType == "interval" && this.interval == undefined){
			var that = this;
			this.interval = setInterval(function(variable){
				console.log("Variable speichern(Interval):" + variable.id, variable.status);
				var now = Math.floor(Date.parse(new Date));
				var query = "INSERT INTO stored_vars (id, time, value) VALUES ('" + variable.id + "', '" + now + "', '" + variable.status + "');";
				db.all(query, function(err, row){
					if(err){
						helper.log.error(err);
					}
				});
			}, that.variable.saveInterval);
		}
	}else{
		this.variable.saveActive = false;
		stopSaveVariable();
	}
};

createVariable.prototype.removeVariable = function() {
	clearInterval(this.interval);
	delete this;
};

module.exports = createVariable;