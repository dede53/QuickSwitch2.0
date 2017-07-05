var db							=	require('./database.js');
var events						=	require('events');


var stopSaveVariable = function(){
	if (this.interval != undefined){
		clearInterval(this.interval);
	}
}

var createVariable = function (variable){
	this.variable = variable;
	this.dependendTimer = [];
	this.setSaveActive(this.variable.saveActive);
}

createVariable.prototype = new events.EventEmitter();

createVariable.prototype.saveVariable = function(data){
	if(data.id){
		var query = "UPDATE variable SET "
					+ "name = '" + data.name + "', "
					+ "status = '" + data.status + "', "
					+ "charttype = '" + data.charttype + "', "
					+ "linetype = '" + data.linetype + "', "
					+ "linecolor = '" + data.linecolor + "', "
					+ "error = '" + data.error + "', "
					+ "lastChange = '" + new Date().getTime() + "', "
					+ "suffix = '" + data.suffix + "', "
					+ "step = '" + data.step + "', "
					+ "showall = '" + data.showall + "', "
					+ "user = '" + data.user + "', "
					+ "saveActive = '" + data.saveActive + "', "
					+ "saveType = '" + data.saveType + "', "
					+ "saveInterval = '" + data.saveInterval + "' "
					+ "WHERE id = '" + data.id + "';";
	}else{
		var query = "INSERT INTO variable (id, name, status, charttype, linetype, linecolor, error, lastChange, suffix, step, showall, user, saveActive, saveType, saveInterval) VALUES ('"+data.id+"', '"+data.name+"', '"+data.status+"', '"+data.charttype+"', '"+data.linetype+"', '"+data.linecolor+"', '"+data.error+"', '"+new Date().getTime()+"', '"+data.suffix+"', '"+data.step+"', '"+data.showall+"', '"+data.user+"', '"+data.saveActive+"', '"+data.saveType+"', '"+data.saveInterval+"')";
	}
	this.variable = data;
	db.run(query);
	this.setSaveActive(data.saveActive);
}

createVariable.prototype.setVariable = function(status, callback){
	var toDatabase = function(variable){
		console.log("Variable speichern(onchange):" + variable.id, variable.status);
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