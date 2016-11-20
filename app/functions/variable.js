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
<<<<<<< HEAD
function favoritVariables(favoritVariables, callback){
	var query = "SELECT * FROM variable;";
	db.all(query, function(err, variab){
		if(err){
			console.log(err);
			return;
		}
		var favoriten = {};
		var variablen = {};
		variab.forEach(function(variable){
			variablen[variable.id] = variable;
		});
		favoritVariables.forEach(function(fav){
			favoriten[fav] = variablen[fav];
		});
		callback(favoriten);
	});
}
function getVariableByNodeid(id, callback){
	var query = "SELECT * FROM variable WHERE id = '" + id + "';";
=======
function getVariableByNodeid(id, callback){
	var query = "SELECT * FROM variable WHERE nodeid = '" + id + "';";
>>>>>>> d3e70a1d720f830c1b7fd87dccb9dd8e639e7874
	db.all(query, function(err, data){
		if(err){
			console.log(err);
			return;
		}else if(data == ""){
<<<<<<< HEAD
			saveNewVariable({"id":id}, function(err, data){
				db.all(query, function(err, data){
					if(err){
						console.log(err);
						return;
					}else{
						callback(data[0]);
					}
				});
			});
		}else{
			callback(data[0]);
		}
=======
			helper.log.debug("Keine Variabel mit der ID: " + id);
			return;
		}
		callback(data[0]);
>>>>>>> d3e70a1d720f830c1b7fd87dccb9dd8e639e7874
	});
}
function getVariableByName(name, callback){
	var query = "SELECT * FROM variable WHERE name = '" + name.trim() + "';";
	db.all(query, function(err, data){
		if(err){
			console.log(err);
			return;
		}else if(data == ""){
<<<<<<< HEAD
			saveNewVariable({"name":name}, function(err, data){
				db.all(query, function(err, data){
					callback(data[0]);
				});
			});
		}else{
			callback(data[0]);
		}
=======
			helper.log.debug("Keine Variabel mit dem Namen: " + name);
			return;
		}
		callback(data[0]);
>>>>>>> d3e70a1d720f830c1b7fd87dccb9dd8e639e7874
	});
}
function loadStoredVariable(variable, hours, callback){
	if(variable.showall == 'true'){
<<<<<<< HEAD
		var query = "SELECT * FROM stored_vars WHERE id = '" + variable.id + "' AND ROUND(time / 1000) <= UNIX_TIMESTAMP() AND ROUND(time / 1000) >= UNIX_TIMESTAMP(DATE_SUB(NOW(), INTERVAL " + hours + " hour)) ORDER BY time ASC;";
	}else{
		var query = "SELECT * FROM stored_vars WHERE id = '" + variable.id + "' AND ROUND(time / 1000) <= UNIX_TIMESTAMP() AND ROUND(time / 1000) >= UNIX_TIMESTAMP(DATE_SUB(NOW(), INTERVAL " + hours + " hour)) GROUP BY HOUR( FROM_UNIXTIME(ROUND(time / 1000)) ) , DATE( FROM_UNIXTIME(ROUND(time / 1000)) ) ORDER BY time ASC;";
=======
		var query = "SELECT * FROM stored_vars WHERE nodeid = '" + variable.nodeid + "' AND ROUND(time / 1000) <= UNIX_TIMESTAMP() AND ROUND(time / 1000) >= UNIX_TIMESTAMP(DATE_SUB(NOW(), INTERVAL " + hours + " hour)) ORDER BY time ASC;";
	}else{
		var query = "SELECT * FROM stored_vars WHERE nodeid = '" + variable.nodeid + "' AND ROUND(time / 1000) <= UNIX_TIMESTAMP() AND ROUND(time / 1000) >= UNIX_TIMESTAMP(DATE_SUB(NOW(), INTERVAL " + hours + " hour)) GROUP BY HOUR( FROM_UNIXTIME(ROUND(time / 1000)) ) , DATE( FROM_UNIXTIME(ROUND(time / 1000)) ) ORDER BY time ASC;";
>>>>>>> d3e70a1d720f830c1b7fd87dccb9dd8e639e7874
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
<<<<<<< HEAD
			helper.log.debug("Keine gespeicherten Daten aus den letzten " + hours + " Stunden für die Variable: " + variable.id + "/" + variable.name);
			callback(false);
		}else{
=======
			helper.log.debug("Keine gespeicherten Daten für die Variable: " + variable.nodeid + "/" + variable.name);
			callback(false);
		}
		else{
>>>>>>> d3e70a1d720f830c1b7fd87dccb9dd8e639e7874
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
	
<<<<<<< HEAD
			var data = new helper.Sensor(variable.id, variable.name, bla, variable.charttype, variable.linetype, variable.linecolor, variable.suffix, 0, variable.step, variable.showall);
=======
			var data = new helper.Sensor(variable.nodeid, variable.name, bla, variable.charttype, variable.linetype, variable.linecolor, variable.suffix, 0, variable.step, variable.showall);
>>>>>>> d3e70a1d720f830c1b7fd87dccb9dd8e639e7874
			callback(data);
		}
	});
}

<<<<<<< HEAD
function getStoredVariables(user, callback){
	var async 			= require("async");
	if( Array.isArray(user.varChart) && user.varChart.length > 0){
		if(user.chartHour){
			var timeRange = user.chartHour;
		}else{
			var timeRange = 24;
		}
		var series = [];
		async.each(user.varChart,
			function(id, callback){
				getVariableByNodeid(id, function(variable){
					// console.log(variable);
					loadStoredVariable(variable, timeRange, function(sensor){
						if(typeof sensor === 'object'){
							sensor.user = user.name;
							series.push(sensor);
						}
						callback();
					});
				});
			},function(err){
				if(err){
					console.log(err);
				}else{
					callback(series);
				}
			}
		);
	}else{
		callback(false);
	}
}
function saveNewVariable(data, callback){
	var query = "INSERT INTO variable (id, name) VALUES ('" + data.id + "', '" + data.id + "');";
	db.all(query, function(err, res){
		if(!err){
			data.id = res.insertId;
			callback(201, data);
		}
	});
}
=======
>>>>>>> d3e70a1d720f830c1b7fd87dccb9dd8e639e7874
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
<<<<<<< HEAD
	favoritVariables: favoritVariables,
	getVariable: getVariableByNodeid,
	getVariableByName: getVariableByName,
	saveNewVariable: saveNewVariable,
	saveEditVariable: function(data,callback){
		var query = "UPDATE variable SET "
					+ "name = '" + data.name + "', "
					+ "id = '" + data.id + "', "
=======
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
>>>>>>> d3e70a1d720f830c1b7fd87dccb9dd8e639e7874
					+ "status = '" + data.status + "', "
					+ "charttype = '" + data.chartype + "', "
					+ "linetype = '" + data.linetype + "', "
					+ "linecolor = '" + data.linecolor + "', "
					+ "error = '" + data.error + "', "
<<<<<<< HEAD
					+ "lastChange = '" + new Date().getTime() + "', "
					+ "WHERE uid = '" + data.uid + "';";
		db.run(query);
		callback(201, data);
	},
	deleteVariable: function(uid, callback){
		var query = "DELETE FROM variable WHERE uid = '" + uid + "';";
=======
					+ "WHERE id = '" + data.id + "';";
		db.run(query);
		callback(201);
	},
	deleteVariable: function(id, callback){
		var query = "DELETE FROM variable WHERE varid = '" + id + "';";
>>>>>>> d3e70a1d720f830c1b7fd87dccb9dd8e639e7874
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
<<<<<<< HEAD
			var variableID = variable[1];
			getVariableByNodeid(variableID, function(variableValue){
				string = string.replace('§' + variableID + '§', variableValue.status);
=======
			var variableName = variable[1];
			getVariableByName(variableName, function(variableValue){
				string = string.replace('§' + variableName + '§', variableValue.status);
>>>>>>> d3e70a1d720f830c1b7fd87dccb9dd8e639e7874
				cb(string);
			});
		}else{
			cb(string);
		}
	},
	setVariable: function(variable, app, callback){
<<<<<<< HEAD
		getVariableByNodeid(variable.id, function(fullVariable){
			var query = "UPDATE variable SET status = '" + variable.status + "', lastChange = '" + new Date().getTime() + "' WHERE id = '" + variable.id + "';";
			db.run(query);
			fullVariable.status = variable.status;
			app.io.broadcast('change', new helper.message('variables:edit',fullVariable));
			// loadStoredVariable(fullVariable, '36', function(data){
			// 	app.io.broadcast('storedVariable', data);
			// });
			callback(200);
		});
	},
	setVariableByNodeid: function(variable, app, callback){
		// console.log(variable);
		var query = "UPDATE variable SET status = '" + variable.status + "', lastChange = '" + new Date().getTime() + "' WHERE id = '" + variable.id + "';";
		db.run(query);
		getVariableByNodeid(variable.id, function(fullVariable){
			fullVariable.id = fullVariable.id;
			app.io.broadcast('change', new helper.message('variables:edit',fullVariable));
			// loadStoredVariable(fullVariable, '36', function(data){
			// 	app.io.broadcast('storedVariable', data);
			// });
			callback(fullVariable);
		});
	},
	storeVariable: function(id){
		getVariableByNodeid(id, function(data){
			var now = Math.floor(Date.parse(new Date));
			var query = "INSERT INTO stored_vars (id, time, value) VALUES ('" + data.id + "', '" + now + "', '" + data.status + "');";
=======
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
>>>>>>> d3e70a1d720f830c1b7fd87dccb9dd8e639e7874
			db.all(query, function(err, row){
				if(err){
					helper.log.error(err);
				}
			});
		});
	},
<<<<<<< HEAD
	getStoredVariables: getStoredVariables
=======
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
>>>>>>> d3e70a1d720f830c1b7fd87dccb9dd8e639e7874
}