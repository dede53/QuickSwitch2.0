var db 				= require('./database.js');
var SwitchServer	= require('./SwitchServer.js');
var async 			= require("async");
var helper 			= require('./helper.js');
// var timerFunctions 	= require('./timer.js');
// var client 			= db.client;

function getVariables(callback){
	var query = "SELECT * FROM variable;";
	db.all(query, function(err, variab){
		if(err){
			console.log(err);
			return;
		}
		variab.forEach(function(variable){
			callback(variable);
		});
	});
}
function getVariableByNodeid(id, callback){
	var query = "SELECT * FROM variable WHERE nodeid = '" + id + "';";
	db.all(query, function(err, data){
		if(err){
			console.log(err);
			return;
		}else if(data == ""){
			helper.log.debug("Keine Variabel mit der ID: " + id);
			return;
		}
		callback(data[0]);
	});
}
function getVariableByName(name, callback){
	var query = "SELECT * FROM variable WHERE name = '" + name.trim() + "';";
	db.all(query, function(err, data){
		if(err){
			console.log(err);
			return;
		}else if(data == ""){
			helper.log.debug("Keine Variabel mit dem Namen: " + name);
			return;
		}
		callback(data[0]);
	});
}
function loadStoredVariable(variable, hours, callback){
	if(variable.showall == 'true'){
		var query = "SELECT * FROM stored_vars WHERE nodeid = '" + variable.nodeid + "' AND ROUND(time / 1000) <= UNIX_TIMESTAMP() AND ROUND(time / 1000) >= UNIX_TIMESTAMP(DATE_SUB(NOW(), INTERVAL " + hours + " hour)) ORDER BY time ASC;";
	}else{
		var query = "SELECT * FROM stored_vars WHERE nodeid = '" + variable.nodeid + "' AND ROUND(time / 1000) <= UNIX_TIMESTAMP() AND ROUND(time / 1000) >= UNIX_TIMESTAMP(DATE_SUB(NOW(), INTERVAL " + hours + " hour)) GROUP BY HOUR( FROM_UNIXTIME(ROUND(time / 1000)) ) , DATE( FROM_UNIXTIME(ROUND(time / 1000)) ) ORDER BY time ASC;";
	}
			/*

				SELECT
					nodeid,
				    temp / 100 as temp,
				    time
				FROM 
					sensor_data
				WHERE 
					nodeid =  '" + sensor.nodeID + "' 
					AND ROUND(time / 1000) <= UNIX_TIMESTAMP() 
					AND ROUND(time / 1000) >= UNIX_TIMESTAMP(DATE_SUB(NOW(), INTERVAL 36 hour)) 
				GROUP BY 
					HOUR( FROM_UNIXTIME(ROUND(time / 1000)) ), 
					DATE( FROM_UNIXTIME(ROUND(time / 1000)) )
					# Nur wenn halbstündlich werte!
					#,(ROUND(timestamp/3600)*3600)
				ORDER BY time ASC;
			*/
	db.all(query , function(err, sensordata) {
		if (err) {
			helper.log.error(err);
			return;
		}else if(sensordata.length == 0){
			helper.log.debug("Keine gespeicherten Daten für die Variable: " + variable.nodeid + "/" + variable.name);
			callback(false);
		}
		else{
			var bla = new Array;
			sensordata.forEach(function(uff){
				// console.log(uff);
				var asd = new Array;
				asd.push(Math.floor(uff.time));
				if(uff.value == 'true'){
					uff.value = 1;
				}else if(uff.value == 'false'){
					uff.value = 0;
				}
				asd.push(parseFloat(uff.value));
				bla.push(asd);
			});
	
			var data = new helper.Sensor(variable.nodeid, variable.name, bla, variable.charttype, variable.linetype, variable.linecolor, variable.suffix, 0, variable.step, variable.showall);
			callback(data);
		}
	});
}

module.exports = {
/****************REDIS*****************
	getVariables: function(callback){
		var r = {};
		client.keys('*', function(err, keys) {
			async.each(keys, function(key, callback) {
				client.get(key, function(err, value) {
					r[key] = value;
					callback(err);
				});
			}, function() {
				// when callback is finished
				// console.log(JSON.stringify(r));
				callback(r);
			});
		});
	},
	getVariable: function(name, cb){
		client.get(name, function(err, data){
			if(err){
				helper.log.error(err);
				return;
			}
			helper.debug(data);
			cb(data);
		});
	},
	saveNewVariable: function(data, callback){
		client.set(data.name, data.status || "false");
		callback(200);
	},
	saveEditVariable:function(data, callback){
		client.set(data.name, data.status);
		callback(200);
	},
	deleteVariable: function(name, callback){
		console.log(name);
		client.DEL(name);
		callback(200);
	},
	replaceVar: function (string, cb){
		if( string.includes("§") ){
			var variable = string.split('§');
			client.get(variable[1], function(err, value){
				if(err){
					console.log(err);
				}else{
					string = string.replace('§' + variable[1] + '§', value);
				}
				cb(string);
			});
		}else{
			cb(string);
		}
	}
**************************************/
//**********************MYSQL************************
	getVariables: getVariables,
	getVariable: getVariableByNodeid,
	getVariableByName: getVariableByName,
	saveNewVariable: function(data, callback){
		var query = "INSERT INTO variable (name) VALUES ('" + data.name + "');";
		db.run(query);
		callback(201);
	},
	saveEditVariable: function(data,callback){
		var query = "UPDATE variable SET "
					+ "name = '" + data.name + "', "
					+ "nodeid = '" + data.varid + "', "
					+ "status = '" + data.status + "', "
					+ "charttype = '" + data.chartype + "', "
					+ "linetype = '" + data.linetype + "', "
					+ "linecolor = '" + data.linecolor + "', "
					+ "error = '" + data.error + "', "
					+ "WHERE id = '" + data.id + "';";
		db.run(query);
		callback(201);
	},
	deleteVariable: function(id, callback){
		var query = "DELETE FROM variable WHERE varid = '" + id + "';";
		db.all(query, function(err, data){
			if(err){
				helper.log.error(err);
				return;
			}
			callback(200);
		});
	},
	replaceVar: function (string, cb){
		if( string.includes("§") ){
			var variable = string.split('§');
			var variableName = variable[1];
			getVariableByName(variableName, function(variableValue){
				string = string.replace('§' + variableName + '§', variableValue.status);
				cb(string);
			});
		}else{
			cb(string);
		}
	},
	setVariable: function(variable, app, callback){
		var query = "UPDATE variable SET status = '" + variable.status + "' WHERE name = '" + variable.name + "';";
		db.run(query);
		getVariableByName(variable.name, function(fullVariable){
			fullVariable.status = variable.status;
			callback(200);
			app.io.broadcast('variable', fullVariable);
			loadStoredVariable(fullVariable, '36', function(data){
				app.io.broadcast('storedVariable', data);
			});
		});
	},
	setVariableByNodeid: function(variable, app, callback){
		var query = "UPDATE variable SET status = '" + variable.status + "' WHERE nodeid = '" + variable.nodeid + "';";
		db.run(query);
		getVariableByNodeid(variable.nodeid, function(fullVariable){
			fullVariable.status = variable.status;
			app.io.broadcast('variable', fullVariable);
			loadStoredVariable(fullVariable, '36', function(data){
				app.io.broadcast('storedVariable', data);
			});
			callback(fullVariable);
		});
	},
	storeVariable: function(name){
		getVariableByName(name, function(data){
			var now = Math.floor(Date.parse(new Date));
			var query = "INSERT INTO stored_vars (nodeid, time, value) VALUES ('" + data.nodeid + "', '" + now + "', '" + data.status + "');";
			db.all(query, function(err, row){
				if(err){
					helper.log.error(err);
				}
			});
		});
	},
	getStoredVariables: function(data, callback){
		if( Array.isArray(data.varChart) && data.varChart.length > 0){
			if(data.hour){
				var timeRange = data.hour;
			}else{
				var timeRange = 36;
			}
			data.varChart.forEach(function(id){
				getVariableByNodeid(id, function(variable){
					loadStoredVariable(variable, timeRange, function(sensor){
						sensor.user = data.name;
						console.log(sensor);
						callback(sensor);
					});
				});
			});
		}else{
			callback(false);
		}
	}
}