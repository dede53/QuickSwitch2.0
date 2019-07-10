var db 				= require('./database.js');
var SwitchServer	= require('./SwitchServer.js');
var async 			= require("async");
var helper 			= require('./helper.js');

function getVariables(callback){
	var query = "SELECT * FROM variable;";
	db.all(query, function(err, variables){
		if(err){
			console.log(err);
			return;
		}
		var variab = {};
		variables.map(function(variable){
			variab[variable.id] = variable;
		});
		callback(variab);
	});
}

function Sensor(id, name, data, charttype, linetype, farbe, valueSuffix, yAxis, step, showAll, connectNulls){
	this.id = id;
	this.name = name;
	this.data = data;
	this.step = step;
	// this.step = Boolean(step);
	this.showAllData = showAll;
	this.type = charttype;
	this.dashStyle = linetype;
	this.color = farbe;
	this.yAxis = yAxis;
	this.connectNulls = connectNulls;
	this.marker = new Object;
	this.marker.symbol = "diamond";
	this.marker.radius = 3;
	this.tooltip = new Object;
	this.tooltip.valueSuffix = valueSuffix;
}

function favoritVariables(favoritVariables, mode, callback){
	var query = "SELECT uid, id, name, status, charttype, linetype, linecolor, suffix, error, step, showall, user, lastChange FROM variable;";
	db.all(query, function(err, variab){
		if(err){
			console.log(err);
			return;
		}
		var variablen = {};
		variab.forEach(function(variable){
			variablen[variable.id] = variable;
		});
		// console.log(favoritVariables);
		if(mode == "array"){
			if(favoritVariables == undefined){
				callback([]);
				return;
			}
			var favoriten = [];
			favoritVariables.forEach(function(fav){
				favoriten.push(variablen[fav]);
			});
		}else{
			if(favoritVariables == undefined){
				callback({});
				return;
			}
			var favoriten = {};
			favoritVariables.forEach(function(fav){
				favoriten[fav] = variablen[fav];
			});
		}
	
		callback(favoriten);
	});
}

function getVariableByNodeid(id, callback){
	var query = "SELECT * FROM variable WHERE id = '" + id + "';";
	db.all(query, function(err, data){
		if(err){
			console.log(err);
			return;
		}else if(data == ""){
			saveNewVariable({"id":id}, function(err, data){
				db.all(query, function(err, data){
					if(err){
						console.log(err);
						return;
					}else{
						callback(data[0], true);
					}
				});
			});
		}else{
			callback(data[0], false);
		}
	});
}
function getVariableByName(name, callback){
	var query = "SELECT * FROM variable WHERE name = '" + name.trim() + "';";
	db.all(query, function(err, data){
		if(err){
			console.log(err);
			return;
		}else if(data == ""){
			saveNewVariable({"name":name}, function(err, data){
				db.all(query, function(err, data){
					callback(data[0]);
				});
			});
		}else{
			callback(data[0]);
		}
	});
}
function loadStoredVariable(variable, hours, callback){
	// SELECT *, AVG(value), from_unixtime(time / 1000) as date, YEAR(from_unixtime(time / 1000)) as Year, MONTH(from_unixtime(time / 1000)) as Month FROM stored_vars GROUP BY id, Year, Month;
	// SELECT uid, id, ROUND(AVG(value), 2) as value, UNIX_TIMESTAMP( DATE(from_unixtime(time / 1000))) * 1000 as date, YEAR(from_unixtime(time / 1000)) as Year, MONTH(from_unixtime(time / 1000)) as Month FROM stored_vars GROUP BY id, Year, Month;
	if(variable.showall == 'true'){
		var query = "SELECT * FROM stored_vars WHERE id = '" + variable.id + "' AND ROUND(time / 1000) <= UNIX_TIMESTAMP() AND ROUND(time / 1000) >= UNIX_TIMESTAMP(DATE_SUB(NOW(), INTERVAL " + hours + " hour)) ORDER BY time ASC;";
	}else{
		var query = "SELECT * FROM stored_vars WHERE id = '" + variable.id + "' AND ROUND(time / 1000) <= UNIX_TIMESTAMP() AND ROUND(time / 1000) >= UNIX_TIMESTAMP(DATE_SUB(NOW(), INTERVAL " + hours + " hour)) GROUP BY HOUR( FROM_UNIXTIME(ROUND(time / 1000)) ) , DATE( FROM_UNIXTIME(ROUND(time / 1000)) ) ORDER BY time ASC;";
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
			log.error(err);
			return;
		}else{
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
			var data = new Sensor(variable.id, variable.name, bla, variable.charttype, variable.linetype, variable.linecolor, variable.suffix, 0, variable.step, variable.showall);
			// console.log(data);
			callback(data);
		}
	});
}
function getStoredVariable(id, hours, callback){
	getVariableByNodeid(id, function(variable, newAdded){
		loadStoredVariable(variable, hours, function(sensor){
			callback(sensor);
		});
	});
}
function getStoredVariables(user, hours, callback){
	var async 			= require("async");
	if( Array.isArray(user.varChart) && user.varChart.length > 0){
		if(hours){
			var timeRange = hours;
		}else if(user.chartHour){
			var timeRange = user.chartHour;
		}else{
			var timeRange = 24;
		}
		var series = [];
		async.each(user.varChart,
			function(id, callback){
				getVariableByNodeid(id, function(variable, newAdded){
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
				log.error(err);
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
	favoritVariables: favoritVariables,
	getVariable: getVariableByNodeid,
	getVariableByName: getVariableByName,
	saveNewVariable: saveNewVariable,
	saveEditVariable: function(data, callback){
		var query = "UPDATE variable SET "
					+ "name = '" + data.name + "', "
					+ "status = '" + data.status + "', "
					+ "charttype = '" + data.charttype + "', "
					+ "linetype = '" + data.linetype + "', "
					+ "linecolor = '" + data.linecolor + "', "
					+ "error = '" + data.error + "', "
					+ "lastChange = '" + new Date().getTime() + "' "
					+ "WHERE id = '" + data.id + "';";
		db.run(query);
		callback(201, data);
	},
	deleteVariable: function(uid, callback){
		var query = "DELETE FROM variable WHERE uid = '" + uid + "';";
		db.all(query, function(err, data){
			if(err){
				log.error(err);
				return;
			}
			callback(200);
		});
	},
	replaceVar: function (string, cb){
		if( string.includes("§") ){
			var variable = string.split('§');
			var variableID = variable[1];
			getVariableByNodeid(variableID, function(variableValue, newAdded){
				string = string.replace('§' + variableID + '§', variableValue.status);
				cb(string);
			});
		}else{
			cb(string);
		}
	},
	setVariable: function(variable, app, callback){
		getVariableByNodeid(variable.id, function(fullVariable, newAdded){
			var query = "UPDATE variable SET status = '" + variable.status + "', lastChange = '" + new Date().getTime() + "' WHERE id = '" + variable.id + "';";
			db.run(query);
			fullVariable.status = variable.status;
			if(newAdded){
				app.io.emit('change', new helper.message('variables:add',fullVariable));
			}else{
				app.io.emit('change', new helper.message('variables:edit',fullVariable));
			}
			callback(200);
			// loadStoredVariable(fullVariable, '36', function(data){
			// 	app.io.emit('storedVariable', data);
			// });
		});
	},
	setVariableByNodeid: function(variable, app, callback){
		// console.log(variable);
		var query = "UPDATE variable SET status = '" + variable.status + "', lastChange = '" + new Date().getTime() + "' WHERE id = '" + variable.id + "';";
		db.run(query);
		getVariableByNodeid(variable.id, function(fullVariable, newAdded){
			fullVariable.id = fullVariable.id;
			app.io.emit('change', new helper.message('variables:edit',fullVariable));
			// loadStoredVariable(fullVariable, '36', function(data){
			// 	app.io.emit('storedVariable', data);
			// });
			callback(fullVariable);
		});
	},
	storeVariable: function(id){
		getVariableByNodeid(id, function(data, newAdded){
			var now = Math.floor(Date.parse(new Date));
			var query = "INSERT INTO stored_vars (id, time, value) VALUES ('" + data.id + "', '" + now + "', '" + data.status + "');";
			db.all(query, function(err, row){
				if(err){
					log.error(err);
				}
			});
		});
	},
	saveVariable: function(data, callback){
		if(data.id){
			var newVariable = false;
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
						+ "saveActive = '" + data.saveActive + "' "
						+ "saveType = '" + data.saveType + "' "
						+ "saveInterval = '" + parseInt(data.saveInterval) || 5 + "' "
						+ "WHERE id = '" + data.id + "';";
		}else{
			var newVariable = true;
			var query = "INSERT INTO variable (id, name, status, charttype, linetype, linecolor, error, lastChange, suffix, step, showall, user, saveActive, saveType, saveInterval) VALUES ('"+data.id+"', '"+data.name+"', '"+data.status+"', '"+data.charttype+"', '"+data.linetype+"', '"+data.linecolor+"', '"+data.error+"', '"+new Date().getTime()+"', '"+data.suffix+"', '"+data.step+"', '"+data.showall+"', '"+data.user+"', '"+data.saveActive+"', '"+data.saveType+"', " + parseInt(data.saveInterval) || 5 + ")";
        }
		db.run(query);
		callback(201, newVariable);
	},
	getStoredVariable: getStoredVariable,
	getStoredVariables: getStoredVariables
}