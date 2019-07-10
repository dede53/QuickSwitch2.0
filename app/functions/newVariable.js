var db							=	require('./database.js');
var events						=	require('events');


function variables(){
	this.variables = {};
	var query = "SELECT * FROM variable;";
	db.all(query, (err, variables) => {
	        if(err){
	                console.log(err);
	                return;
	        }
	        variables.forEach((variable) => {
	                this.add(variable);
	        });
	});

}

variables.prototype = new events.EventEmitter();

variables.prototype.replaceVar = function (string, cb){
	if( string.includes("§") ){
		var variable = string.split('§');
		string = string.replace('§' + variable[1] + '§', this.variables[variable[1]].status);
		cb(string);
	}else{
		cb(string);
	}
}

variables.prototype.add = function(variable) {
	this.variables[variable.id] = new createVariable(variable);
	this.saveVariable(this.variables[variable.id]);
	// this.setSaveActive(variable.id, this.variables[variable.id].saveActive);
	this.emit("new", this.variables[variable.id]);
};

variables.prototype.stopSaveVariable = function(id){
	if (this.variables[id].interval != undefined){
		clearInterval(this.variables[id].interval);
	}
}

variables.prototype.saveVariable = function(data){
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
	this.variables[data.id] = data;
	db.run(query);
	// uid!!
	this.setSaveActive(data.id, data.saveActive);
}

variables.prototype.setVariable = function(id, status, callback){
	if(!this.variables[id]){
		this.add({id: id});
	}
	if(status != this.variables[id].status){
		var now = Math.floor(Date.parse(new Date));
		this.variables[id].status = status;
		if(this.variables[id].saveActive == true || this.variables[id].saveActive == 'true'){
			if(this.variables[id].saveType == "onchange"){
				console.log("Variable speichern(onchange):" + id, status);
				var query = "INSERT INTO stored_vars (id, time, value) VALUES ('" + id + "', '" + now + "', '" + status + "');";
				db.run(query);
			}
		}
		this.variables[id].status = status;
		this.variables[id].lastChange = now;
		
		var query = "UPDATE variable SET status = '" + status + "', lastChange = '" + now + "' WHERE id = '" + id + "';";
		db.run(query);
		
		this.emit('change', this.variables[id]);
		if(callback){
			callback(200);
		}
	}else{
		if (callback) {
			callback(304);
		}
	}
};

variables.prototype.getVariable = function(id, callback){
	if(this.variables[id] == undefined){
		callback({
			"status": "error"
		});
		return;
	}
	callback(this.variables[id]);
}

variables.prototype.setSaveActive = function(id, status){
	if(status == true || status == 'true'){
		this.variables[id].saveActive = true;
		if(this.variables[id].saveType == "interval" && this.variables[id].interval == undefined){
			this.variables[id].interval = setInterval(() => {
				console.log("Variable speichern(Interval):" + id, this.variables[id].status);
				var now = Math.floor(Date.parse(new Date));
				var query = "INSERT INTO stored_vars (id, time, value) VALUES ('" + id + "', '" + now + "', '" + status + "');";
				db.all(query, function(err, row){
					if(err){
						helper.log.error(err);
					}
				});
			}, this.variables[id].saveInterval);
		}
	}else{
		this.variables[id].saveActive = false;
		this.stopSaveVariable(id);
	}
};

variables.prototype.removeVariable = function(id) {
	clearInterval(this.variables[id].interval);
	this.emit('removed', this.variables[id]);
	delete this.variables[id];
};

variables.prototype.getHistory = function(id, start, end, callback){

	if(end == null){
		end = new Date().getTime();
	}
	if(start == null){
		start = 0;
	}
	var range = end - start;
	var database = "stored_vars_month";
	if(range < 2 * 24 * 3600 * 1000){
		database = "stored_vars";
	}else if(range < 31 * 24 * 3600 * 1000){
		database = "stored_vars_hour";
	}else if(range < 15 * 31 * 24 * 3600 * 1000){
		database = "stored_vars_day";
	}
	var sql = "select CAST(time as signed) as x, CAST(value as signed) as y from " + database + " where id='" + id + "' and time between " + start + " and " + end + " order by time limit 0, 5000;";
	console.log(sql);
	db.all(sql, (err, data) => {
		// Dont want > 1.000.000 points in the ram...
		var series = this.variables[id];
		series.data = data;
		callback(series);
	});
}

module.exports = variables;

function createVariable(variable){
	this.uid 			= variable.uid;
	this.id 			= variable.id;
	this.name 			= variable.name				|| variable.id;
	this.status 		= variable.status			|| "";
	this.charttype 		= variable.charttype		|| "spline";
	this.linetype		= variable.linetype			|| "solid";
	this.linecolor 		= variable.linecolor		|| "#ff00ff";
	this.suffix 		= variable.suffix			|| "";
	this.error			= variable.error			|| undefined;
	this.step 			= variable.step 			|| false;
	this.showall 		= variable.showall 			|| false;
	this.user 			= variable.user				|| "system";
	this.saveActive 	= variable.saveActive 		|| false;
	this.saveType 		= variable.saveType 		|| "onchange";
	this.saveInterval	= variable.saveInterval 	|| 5;
	this.lastChange 	= variable.lastChange		|| 0;
	this.dependendTimer = new Array();
	this.interval 		= undefined;

	/*
		{
			uid: 32,
			id: 'arduino.switch.analog.1',
			name: 'arduino.switch.analog.1',
			status: '12',
			charttype: '',
			linetype: '',
			linecolor: '',
			suffix: '',
			error: '',
			step: 'false',
			showall: 'false',
			user: 'system',
			saveActive: 'false',
			saveType: 'onchange',
			saveInterval: 5,
			lastChange: '1551117683161'
		}
	*/
}